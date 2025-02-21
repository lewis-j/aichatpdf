import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";

export const defaultFileConfig = {
  "application/pdf": {
    extensions: [".pdf"],
    loader: PDFLoader,
  },
  "text/plain": {
    extensions: [".txt", ".text"],
    loader: TextLoader,
  },
  "text/csv": {
    extensions: [".csv"],
    loader: CSVLoader,
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extensions: [".docx", ".doc"],
    loader: DocxLoader,
  },
  "application/json": {
    extensions: [".json", ".jsonld"],
    loader: JSONLoader,
  },
  "text/markdown": {
    extensions: [".md", ".markdown", ".mdown", ".mkd"],
    loader: UnstructuredLoader,
  },
} as const;

export type FileConfig = typeof defaultFileConfig;
