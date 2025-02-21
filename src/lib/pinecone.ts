import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import fs from "fs/promises";
let pinecone: Pinecone | undefined;
import md5 from "md5";
import { convertToAscii } from "./utils";
import { getDocumentLoader, isAllowedFileExtension } from "./fileTypes";

export const getPineconeClient = async (): Promise<Pinecone> => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
};

type Page = {
  pageContent: string;
  metadata: any; // Each loader has different metadata structure
};

export async function loadS3IntoPinecone(file_key: string) {
  console.log("downloading s3 file into filesystem");
  const result = await downloadFromS3(file_key);

  if (!result || !result.file_name) {
    throw new Error("Failed to download file from S3");
  }

  // Add type guard for supported file types
  if (!isAllowedFileExtension(result.extension)) {
    throw new Error(`Unsupported file type: ${result.extension}`);
  }

  try {
    const loader = getDocumentLoader(result.extension, result.file_name);
    const pages = (await loader.load()) as Page[];
    console.log("pages", pages);
    // Clean up the temporary file after loading
    await fs.unlink(result.file_name);

    //2. split and segment into documents
    const documents = await Promise.all(
      pages.map((page, index) => prepareDocument(page, index + 1))
    );

    //3. vectorize and embed individual documents
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    //4. upload to pinecone
    const client = await getPineconeClient();

    const namespace = convertToAscii(file_key);
    const pineconeIndex = client.index("chatpdf-yt").namespace(namespace);
    await pineconeIndex.upsert(vectors);

    return documents[0];
  } catch (error) {
    // Make sure we still clean up even if processing fails
    await fs.unlink(result.file_name).catch(console.error);
    throw error;
  }
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.pageContent,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("Error embedding documents", error);
    throw error;
  }
}

async function prepareDocument(page: Page, fallbackPageNumber: number) {
  const { pageContent, metadata } = page;
  const cleanContent = pageContent.replace(/\n/g, "");

  // Extract page number from metadata if available, otherwise use fallback
  const pageNumber = metadata?.loc?.pageNumber || fallbackPageNumber;

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent: cleanContent,
      metadata: {
        pageNumber,
      },
    }),
  ]);
  return docs;
}
