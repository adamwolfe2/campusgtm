"use client";

import * as React from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkspaceWithModules } from "@/lib/database/workspace-service";
import { exportToPDF, downloadMarkdown } from "@/lib/export/export-service";
import { toast } from "sonner";

interface ExportDialogProps {
  workspace: WorkspaceWithModules;
  trigger?: React.ReactNode;
}

export function ExportDialog({ workspace, trigger }: ExportDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      exportToPDF(workspace);
      toast.success("PDF exported successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to export PDF");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      downloadMarkdown(workspace);
      toast.success("Markdown exported successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to export Markdown");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Export Strategy</DialogTitle>
          <DialogDescription>
            Choose a format to export your GTM strategy
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* PDF Export */}
          <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={handleExportPDF}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-white">
                  <FileDown className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">PDF Document</CardTitle>
                  <CardDescription>
                    Professional PDF with formatting
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Best for printing and sharing with stakeholders. Includes all
                modules with proper formatting and pagination.
              </p>
            </CardContent>
          </Card>

          {/* Markdown Export */}
          <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={handleExportMarkdown}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Markdown File</CardTitle>
                  <CardDescription>
                    Plain text with markdown syntax
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Best for editing in other tools like Notion, Obsidian, or any
                markdown editor. Easy to version control and collaborate.
              </p>
            </CardContent>
          </Card>
        </div>

        {isExporting && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Exporting...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
