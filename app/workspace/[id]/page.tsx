"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StrategyModulesGrid } from "@/components/strategy-module-view";
import { ExportDialog } from "@/components/export-dialog";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Sparkles, Loader2, Trash2, Wifi, WifiOff } from "lucide-react";
import { getWorkspace, deleteWorkspace, type WorkspaceWithModules } from "@/lib/database/workspace-service";
import { useRealtimeWorkspaceEvents, useWorkspaceEventListener } from "@/lib/realtime/hooks";
import { toast } from "sonner";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [workspace, setWorkspace] = useState<WorkspaceWithModules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const workspaceId = params.id as string;

  // Subscribe to realtime workspace events
  const { isConnected } = useRealtimeWorkspaceEvents(workspaceId);

  // Function to load workspace data
  const loadWorkspace = useCallback(async () => {
    try {
      if (!workspaceId) {
        toast.error("Invalid workspace ID");
        router.push("/dashboard");
        return;
      }

      const loadedWorkspace = await getWorkspace(workspaceId, user?.id);
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
    }
  }, [workspaceId, user?.id, router]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadWorkspace();
      setIsLoading(false);
    };
    init();
  }, [loadWorkspace]);

  // Listen for realtime workspace events and auto-refresh
  useWorkspaceEventListener(workspaceId, useCallback((event) => {
    console.log('[WorkspacePage] Received workspace event:', event);

    // Show a subtle notification
    const eventMessages: Record<string, string> = {
      'module_updated': 'Module updated',
      'block_added': 'Content added',
      'user_joined': 'User joined workspace',
      'strategy_generated': 'Strategy generated',
    };

    const message = eventMessages[event.event_type] || 'Workspace updated';
    toast.info(message, {
      description: 'Refreshing workspace...',
      duration: 2000,
    });

    // Reload workspace data
    loadWorkspace();
  }, [loadWorkspace]));

  const handleDeleteWorkspace = async () => {
    if (!workspace) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace(workspace.id, user?.id);
      toast.success("Workspace deleted successfully");
      router.push("/workspaces");
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete workspace"
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

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
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">
                  {workspace.name}
                </h1>
                {/* Realtime Connection Indicator */}
                <AnimatePresence>
                  {isConnected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400"
                      title="Live updates enabled"
                    >
                      <Wifi className="h-3 w-3" />
                      Live
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Delete Workspace?"
            description={`Are you sure you want to delete "${workspace.name}"? This will permanently delete all strategy modules, content, and data. This action cannot be undone.`}
            confirmText="Delete Workspace"
            cancelText="Cancel"
            onConfirm={handleDeleteWorkspace}
            isLoading={isDeleting}
            variant="destructive"
          />

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
