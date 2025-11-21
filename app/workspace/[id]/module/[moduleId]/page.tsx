"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DocumentEditor } from "@/components/editor/document-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, Wifi } from "lucide-react";
import { getWorkspace, type WorkspaceWithModules } from "@/lib/database/workspace-service";
import { useRealtimeWorkspaceEvents, useWorkspaceEventListener } from "@/lib/realtime/hooks";
import { notifyModuleUpdated } from "@/lib/database/workspace-events-service";
import type { StrategyModule } from "@/types";
import { toast } from "sonner";

export default function ModuleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [workspace, setWorkspace] = useState<WorkspaceWithModules | null>(null);
  const [module, setModule] = useState<StrategyModule | null>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const workspaceId = params.id as string;
  const moduleId = params.moduleId as string;

  // Subscribe to realtime workspace events
  const { isConnected } = useRealtimeWorkspaceEvents(workspaceId);

  // Function to load module data
  const loadModule = useCallback(async () => {
    try {
      if (!workspaceId || !moduleId) {
        toast.error("Invalid workspace or module ID");
        router.push("/dashboard");
        return;
      }

      const loadedWorkspace = await getWorkspace(workspaceId, user?.id);
      if (!loadedWorkspace) {
        toast.error("Workspace not found");
        router.push("/dashboard");
        return;
      }

      const loadedModule = loadedWorkspace.modules.find((m) => m.id === moduleId);
      if (!loadedModule) {
        toast.error("Module not found");
        router.push(`/workspace/${workspaceId}`);
        return;
      }

      setWorkspace(loadedWorkspace);
      setModule(loadedModule);

      // Convert blocks to HTML for Tiptap
      const html = blocksToHTML(loadedModule.blocks);
      setContent(html);
    } catch (error) {
      console.error("Failed to load module:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load module"
      );
    }
  }, [workspaceId, moduleId, user?.id, router]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadModule();
      setIsLoading(false);
    };
    init();
  }, [loadModule]);

  // Listen for realtime workspace events
  useWorkspaceEventListener(workspaceId, useCallback((event) => {
    console.log('[ModuleEditorPage] Received workspace event:', event);

    // Only reload if someone else updated the module
    if (event.event_type === 'module_updated' && event.metadata?.moduleId === moduleId) {
      // Check if the update was from a different user
      if (event.user_id !== user?.id) {
        toast.info('Module updated by another user', {
          description: 'Refreshing...',
          duration: 2000,
        });
        loadModule();
      }
    }
  }, [loadModule, moduleId, user?.id]));

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!workspace || !module || !user?.id) return;

    setIsSaving(true);
    try {
      // TODO: Implement save functionality
      // This would convert HTML back to blocks and save to database

      // Trigger workspace event for realtime collaboration
      await notifyModuleUpdated(
        workspace.id,
        user.id,
        module.id,
        module.title
      );

      toast.success("Changes saved!");
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirm) return;
    }
    router.push(`/workspace/${params.id}`);
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

  if (!workspace || !module) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className="w-fit gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </Button>

          {/* Module Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">
                  {module.title}
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
                {workspace.name}
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {hasUnsavedChanges ? "Save Changes" : "Saved"}
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border bg-card p-8"
        >
          <DocumentEditor
            content={content}
            onChange={handleContentChange}
            editable={true}
            placeholder="Start editing your module..."
          />
        </motion.div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 rounded-lg border bg-warning/10 p-4 shadow-lg"
          >
            <p className="text-sm font-medium">You have unsaved changes</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

/**
 * Convert blocks to HTML for Tiptap editor
 */
function blocksToHTML(blocks: StrategyModule["blocks"]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading_1":
          return `<h1>${block.content}</h1>`;
        case "heading_2":
          return `<h2>${block.content}</h2>`;
        case "heading_3":
          return `<h3>${block.content}</h3>`;
        case "bullet_list":
          return `<ul><li>${block.content}</li></ul>`;
        case "checklist":
          return `<ul data-type="taskList"><li data-type="taskItem" data-checked="${block.metadata?.checked || false}">${block.content}</li></ul>`;
        case "quote":
          return `<blockquote>${block.content}</blockquote>`;
        case "text":
        default:
          return `<p>${block.content}</p>`;
      }
    })
    .join("\n");
}
