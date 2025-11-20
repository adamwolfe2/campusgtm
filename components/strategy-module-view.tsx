"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { StrategyModule } from "@/types";
import { StrategyModuleType } from "@/types";
import { BlockListRenderer } from "@/components/block-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, MessageSquare, FileText, Zap, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateBlockContent } from "@/lib/client/block-operations";
import { toast } from "sonner";

interface StrategyModuleViewProps {
  module: StrategyModule;
  workspaceId?: string;
  className?: string;
  editable?: boolean;
}

const MODULE_ICONS = {
  [StrategyModuleType.AMBASSADOR_PROGRAM]: Users,
  [StrategyModuleType.CONTENT_CALENDAR]: Calendar,
  [StrategyModuleType.ICP_DEFINITION]: FileText,
  [StrategyModuleType.OUTREACH_SCRIPTS]: MessageSquare,
  [StrategyModuleType.VIRALITY_ENGINE]: Zap,
};

const MODULE_COLORS = {
  [StrategyModuleType.AMBASSADOR_PROGRAM]: "bg-blue-500",
  [StrategyModuleType.CONTENT_CALENDAR]: "bg-green-500",
  [StrategyModuleType.ICP_DEFINITION]: "bg-orange-500",
  [StrategyModuleType.OUTREACH_SCRIPTS]: "bg-purple-500",
  [StrategyModuleType.VIRALITY_ENGINE]: "bg-pink-500",
};

/**
 * Displays a complete strategy module with all its blocks
 */
export function StrategyModuleView({
  module,
  workspaceId,
  className,
  editable = false,
}: StrategyModuleViewProps) {
  const Icon = MODULE_ICONS[module.type] || FileText;
  const colorClass = MODULE_COLORS[module.type] || "bg-gray-500";

  const handleBlockUpdate = async (blockId: string, content: string) => {
    try {
      const result = await updateBlockContent(blockId, content);

      if (!result.success) {
        toast.error(result.error || "Failed to save changes");
        return;
      }

      toast.success("Changes saved");
    } catch (error) {
      console.error("Failed to update block:", error);
      toast.error("Failed to save changes");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full", className)}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-white",
                  colorClass
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle>{module.title}</CardTitle>
            </div>
            {editable && workspaceId && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/workspace/${workspaceId}/module/${module.id}`}>
                  <Edit3 className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <BlockListRenderer
            blocks={module.blocks}
            editable={editable}
            onUpdateBlock={editable ? handleBlockUpdate : undefined}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Displays a grid of strategy modules
 */
interface StrategyModulesGridProps {
  modules: StrategyModule[];
  workspaceId?: string;
  className?: string;
  editable?: boolean;
}

export function StrategyModulesGrid({
  modules,
  workspaceId,
  className,
  editable,
}: StrategyModulesGridProps) {
  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No strategy modules yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete the onboarding to generate your GTM strategy
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", className)}>
      {modules.map((module, index) => (
        <motion.div
          key={module.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StrategyModuleView
            module={module}
            workspaceId={workspaceId}
            editable={editable}
          />
        </motion.div>
      ))}
    </div>
  );
}
