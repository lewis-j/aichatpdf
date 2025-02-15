import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
let pinecone: Pinecone | undefined;
import md5 from "md5";
import { convertToAscii } from "./utils";

export const getPineconeClient = async (): Promise<Pinecone> => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(file_key: string) {
  console.log("downloading s3 file into filesystem");
  const file_name = await downloadFromS3(file_key);

  if (!file_name) {
    throw new Error("Failed to download file from S3");
  }

  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  //2. split and segmet pdf into documents

  const documents = await Promise.all(pages.map(prepareDocument));

  //3. vectorize and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  //4. upload to pinecone
  const client = await getPineconeClient();

  const namespace = convertToAscii(file_key);
  const pineconeIndex = client.index("chatpdf-yt").namespace(namespace);
  await pineconeIndex.upsert(vectors);

  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("Error embedding documents", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};
async function prepareDocument(page: PDFPage) {
  const { pageContent, metadata } = page;
  pageContent.replace(/\n/g, "");
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
