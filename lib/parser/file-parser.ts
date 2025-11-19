/**
 * File Parser Service
 * Extracts text content from uploaded documents (PDF, DOCX)
 */

import pdf from "pdf-parse";
import mammoth from "mammoth";

export interface ParsedDocument {
  fileName: string;
  fileType: string;
  content: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    author?: string;
    title?: string;
  };
  parsedAt: Date;
}

export const SupportedFileType = {
  PDF: "application/pdf",
  DOCX:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  DOC: "application/msword",
  TXT: "text/plain",
} as const;

export type SupportedFileType =
  (typeof SupportedFileType)[keyof typeof SupportedFileType];

/**
 * Parses a file and extracts its text content
 */
export async function parseFile(
  file: File
): Promise<ParsedDocument> {
  const fileType = file.type as SupportedFileType;

  if (!isSupportedFileType(fileType)) {
    throw new Error(
      `Unsupported file type: ${fileType}. Supported types: PDF, DOCX, DOC, TXT`
    );
  }

  const buffer = await file.arrayBuffer();

  switch (fileType) {
    case SupportedFileType.PDF:
      return parsePDF(buffer, file.name);

    case SupportedFileType.DOCX:
    case SupportedFileType.DOC:
      return parseDOCX(buffer, file.name);

    case SupportedFileType.TXT:
      return parseTXT(buffer, file.name);

    default: {
      const exhaustiveCheck: never = fileType;
      throw new Error(`Unhandled file type: ${exhaustiveCheck}`);
    }
  }
}

/**
 * Parses a PDF file
 */
async function parsePDF(
  buffer: ArrayBuffer,
  fileName: string
): Promise<ParsedDocument> {
  try {
    const data = await pdf(Buffer.from(buffer));

    return {
      fileName,
      fileType: "PDF",
      content: cleanText(data.text),
      metadata: {
        pageCount: data.numpages,
        wordCount: countWords(data.text),
        title: data.info?.Title,
        author: data.info?.Author,
      },
      parsedAt: new Date(),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Parses a DOCX file
 */
async function parseDOCX(
  buffer: ArrayBuffer,
  fileName: string
): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({
      arrayBuffer: buffer,
    });

    return {
      fileName,
      fileType: "DOCX",
      content: cleanText(result.value),
      metadata: {
        wordCount: countWords(result.value),
      },
      parsedAt: new Date(),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse DOCX: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Parses a plain text file
 */
async function parseTXT(
  buffer: ArrayBuffer,
  fileName: string
): Promise<ParsedDocument> {
  try {
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(buffer);

    return {
      fileName,
      fileType: "TXT",
      content: cleanText(text),
      metadata: {
        wordCount: countWords(text),
      },
      parsedAt: new Date(),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TXT: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Checks if a file type is supported
 */
export function isSupportedFileType(fileType: string): boolean {
  return Object.values(SupportedFileType).includes(
    fileType as SupportedFileType
  );
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Validates file size (max 10MB)
 */
export function validateFileSize(file: File, maxSizeMB = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Cleans extracted text
 */
function cleanText(text: string): string {
  return (
    text
      .replace(/\r\n/g, "\n") // Normalize line breaks
      .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
  );
}

/**
 * Counts words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Truncates text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + "...";
}

/**
 * Generates a summary prompt for AI based on parsed documents
 */
export function generateDocumentSummaryPrompt(
  documents: ParsedDocument[]
): string {
  let prompt = `I have uploaded the following documents:\n\n`;

  documents.forEach((doc, index) => {
    prompt += `Document ${index + 1}: ${doc.fileName} (${doc.fileType})\n`;
    prompt += `Content Preview:\n${truncateText(doc.content, 1000)}\n\n`;
  });

  prompt += `Based on these documents, extract key information about the company including:\n`;
  prompt += `- Company name and mission\n`;
  prompt += `- Products or services offered\n`;
  prompt += `- Target audience\n`;
  prompt += `- Unique value proposition\n`;
  prompt += `- Any relevant context for building a GTM strategy\n`;

  return prompt;
}
