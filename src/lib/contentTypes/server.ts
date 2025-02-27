import { SUPPORTED_CONTENT_TYPES, ContentType, FileExtension } from "./client";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";

// Define loader mapping with exact type checking
type LoaderClass =
  | typeof PDFLoader
  | typeof TextLoader
  | typeof CSVLoader
  | typeof DocxLoader
  | typeof JSONLoader
  | typeof UnstructuredLoader;

// Define loader mapping with exact type checking
const loaderMap: Record<ContentType, LoaderClass> = {
  "application/pdf": PDFLoader,
  "text/plain": TextLoader,
  "text/csv": CSVLoader,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    DocxLoader,
  "application/json": JSONLoader,
  "text/markdown": UnstructuredLoader,
};

export function createDocumentLoader(
  extension: FileExtension,
  filePath: string
) {
  // Find the mime type that includes this extension
  const [mimeType] =
    (
      Object.entries(SUPPORTED_CONTENT_TYPES) as [
        ContentType,
        readonly FileExtension[]
      ][]
    ).find(([, extensions]) => extensions.includes(extension)) ?? [];

  if (!mimeType) {
    throw new Error(`Unsupported file extension: ${extension}`);
  }

  const LoaderClass = loaderMap[mimeType as ContentType];
  if (!LoaderClass) {
    throw new Error(`No loader found for mime type: ${mimeType}`);
  }

  return new LoaderClass(filePath);
}
