// lib/rag/files.ts
import * as fs from "fs";
import path from "path";
import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text"
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { JSONLoader,
  JSONLinesLoader, } from "@langchain/classic/document_loaders/fs/json";
import { Document } from "@langchain/core/documents";


const DOCS_DIR = path.join(process.cwd(), "docs");

// singlefile loader（only one path）
export async function loadSingleDocument(
  filePath: string
): Promise<Document[]> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".txt":
    case ".md": {
      const loader = new TextLoader(filePath);
      return loader.load();
    }
    case ".pdf": {
      const loader = new PDFLoader(filePath);
      return loader.load();
    }
    case ".docx": {
      const loader = new DocxLoader(filePath);
      return loader.load();
    }
    case ".csv": {
      const loader = new CSVLoader(filePath, "text");
      return loader.load();
    }
    case ".json": {
      const loader = new JSONLoader(filePath, "/texts");
      return loader.load();
    }
    case ".jsonl": {
      const loader = new JSONLinesLoader(filePath, "/html");
      return loader.load();
    }
    default: {
      // unsupported type will generate a undefined, avoid an error
      throw new Error(`Unsupported: ${ext}`);
    }
  }
}


export async function loadDocumentsFromFolder() {
  const loader = new DirectoryLoader(DOCS_DIR, {
    ".txt": (p) => new TextLoader(p),
    ".md": (p) => new TextLoader(p),
    ".pdf": (p) => new PDFLoader(p),
    ".docx": (p) => new DocxLoader(p),
    ".csv": (p) => new CSVLoader(p, "text"),
    ".json": (p) => new JSONLoader(p, "/texts"),
    ".jsonl": (p) => new JSONLinesLoader(p, "/html"),
  });

  const docs = await loader.load();
  return docs;
}


