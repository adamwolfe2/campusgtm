"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StrategyModulesGrid } from "@/components/strategy-module-view";
import { ExportDialog } from "@/components/export-dialog";
import { Button } from "@/components/ui/button";
import {  ArrowLeft, Download, Share2, Edit3, Sparkles, Loader2 } from "lucide-react";
import { getWorkspace, type WorkspaceWithModules } from "@/lib/database/workspace-service";
import { toast } from "sonner";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [workspace, setWorkspace] = useState<WorkspaceWithModules | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const id = params.id as string;
        if (!id) {
          toast.error("Invalid workspace ID");
          router.push("/dashboard");
          return;
        }

        const loadedWorkspace = await getWorkspace(id, user?.id);
        if (!loadedWorkspace) {
          toast.error("Workspace not found");
          router.push("/dashboard");
          return;
        }

        setWorkspace(loadedWorkspace);
      } catch (error) {
        console.error("Failed to load workspace:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load workspace"
        );
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspace();
  }, [params.id, router, user?.id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="w-fit gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Workspace Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                {workspace.name}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {workspace.companyName}
                {workspace.companyUrl && (
                  <>
                    {" · "}
                    <a
                      href={workspace.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {workspace.companyUrl}
                    </a>
                  </>
                )}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Created {workspace.createdAt.toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <ExportDialog workspace={workspace} />
            </div>
          </div>

          {/* Strategy Summary */}
          {workspace.generatedStrategy && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border bg-primary/5 p-6"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">AI-Generated Strategy</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {workspace.generatedStrategy.summary}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Strategy Modules */}
        <StrategyModulesGrid
          modules={workspace.modules}
          workspaceId={workspace.id}
          editable={true}
        />
      </div>
    </DashboardLayout>
  );
}
