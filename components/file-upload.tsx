"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  parseFile,
  formatFileSize,
  validateFileSize,
  type ParsedDocument,
} from "@/lib/parser/file-parser";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesProcessed?: (documents: ParsedDocument[]) => void;
  maxFiles?: number;
  className?: string;
}

interface UploadedFile {
  file: File;
  status: "uploading" | "processing" | "success" | "error";
  parsedDocument?: ParsedDocument;
  error?: string;
}

export function FileUpload({
  onFilesProcessed,
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      // Validate number of files
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Add files with uploading status
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        status: "uploading" as const,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Process each file
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];

        // Validate file size
        if (!validateFileSize(file)) {
          setUploadedFiles((prev) =>
            prev.map((uf) =>
              uf.file === file
                ? { ...uf, status: "error", error: "File too large (max 10MB)" }
                : uf
            )
          );
          continue;
        }

        // Update status to processing
        setUploadedFiles((prev) =>
          prev.map((uf) =>
            uf.file === file ? { ...uf, status: "processing" } : uf
          )
        );

        try {
          // Parse the file
          const parsedDocument = await parseFile(file);

          // Update with success
          setUploadedFiles((prev) =>
            prev.map((uf) =>
              uf.file === file
                ? { ...uf, status: "success", parsedDocument }
                : uf
            )
          );
        } catch (error) {
          // Update with error
          setUploadedFiles((prev) =>
            prev.map((uf) =>
              uf.file === file
                ? {
                    ...uf,
                    status: "error",
                    error:
                      error instanceof Error
                        ? error.message
                        : "Failed to parse file",
                  }
                : uf
            )
          );
        }
      }
    },
    [uploadedFiles, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    maxFiles,
    multiple: true,
  });

  const removeFile = (file: File) => {
    setUploadedFiles((prev) => prev.filter((uf) => uf.file !== file));
  };

  // Notify parent when files are processed
  React.useEffect(() => {
    const successfulDocs = uploadedFiles
      .filter((uf) => uf.status === "success" && uf.parsedDocument)
      .map((uf) => uf.parsedDocument!);

    if (successfulDocs.length > 0) {
      onFilesProcessed?.(successfulDocs);
    }
  }, [uploadedFiles, onFilesProcessed]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            "mb-4 h-10 w-10",
            isDragActive ? "text-primary" : "text-muted-foreground"
          )}
        />
        <p className="text-center font-medium">
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop files here, or click to browse"}
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          PDF, DOCX, DOC, TXT (max 10MB each)
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Up to {maxFiles} files
        </p>
      </div>

      {/* Uploaded Files List */}
      <AnimatePresence mode="popLayout">
        {uploadedFiles.map((uploadedFile) => (
          <motion.div
            key={uploadedFile.file.name}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex items-center gap-3 rounded-lg border bg-card p-4"
          >
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>

            {/* File Info */}
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium">{uploadedFile.file.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatFileSize(uploadedFile.file.size)}</span>
                {uploadedFile.parsedDocument && (
                  <>
                    <span>•</span>
                    <span>
                      {uploadedFile.parsedDocument.metadata?.wordCount} words
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {uploadedFile.status === "uploading" && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
              {uploadedFile.status === "processing" && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Processing...
                  </span>
                </div>
              )}
              {uploadedFile.status === "success" && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {uploadedFile.status === "error" && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="text-sm text-destructive">
                    {uploadedFile.error}
                  </span>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeFile(uploadedFile.file)}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Summary */}
      {uploadedFiles.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <p className="font-medium">
            {uploadedFiles.filter((uf) => uf.status === "success").length} of{" "}
            {uploadedFiles.length} files processed successfully
          </p>
        </div>
      )}
    </div>
  );
}
