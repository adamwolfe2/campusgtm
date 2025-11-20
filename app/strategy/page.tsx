"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StrategyModuleView } from "@/components/strategy-module-view";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Building2,
  Users,
  Calendar,
  FileText,
  Zap,
} from "lucide-react";
import { getWorkspaces } from "@/lib/database/workspace-service";
import { StrategyModuleType } from "@/types";
import type { StrategyModule } from "@/types";
import { ModuleListSkeleton } from "@/components/loading-skeletons";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StrategyModuleWithWorkspace extends StrategyModule {
  workspaceName: string;
  companyName: string;
}

const MODULE_TYPE_INFO = {
  [StrategyModuleType.AMBASSADOR_PROGRAM]: {
    label: "Ambassador Programs",
    icon: Users,
    color: "bg-blue-500",
  },
  [StrategyModuleType.CONTENT_CALENDAR]: {
    label: "Content Calendars",
    icon: Calendar,
    color: "bg-green-500",
  },
  [StrategyModuleType.ICP_DEFINITION]: {
    label: "ICP Definitions",
    icon: FileText,
    color: "bg-orange-500",
  },
  [StrategyModuleType.OUTREACH_SCRIPTS]: {
    label: "Outreach Scripts",
    icon: MessageSquare,
    color: "bg-purple-500",
  },
  [StrategyModuleType.VIRALITY_ENGINE]: {
    label: "Virality Tactics",
    icon: Zap,
    color: "bg-pink-500",
  },
};

export default function StrategyModulesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [modules, setModules] = useState<StrategyModuleWithWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const loadModules = async () => {
      try {
        setIsLoading(true);
        const workspaces = await getWorkspaces(user?.id);

        // Extract all modules from all workspaces
        const allModules: StrategyModuleWithWorkspace[] = [];

        workspaces.forEach((workspace) => {
          workspace.modules.forEach((module) => {
            allModules.push({
              ...module,
              workspaceName: workspace.name,
              companyName: workspace.companyName,
            });
          });
        });

        setModules(allModules);
      } catch (err) {
        console.error("Failed to load strategy modules:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load strategy modules"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadModules();
  }, [user?.id]);

  const hasModules = modules.length > 0;

  // Filter modules by type
  const filteredModules =
    activeTab === "all"
      ? modules
      : modules.filter((m) => m.type === activeTab);

  // Count modules by type
  const moduleCounts = modules.reduce((acc, module) => {
    acc[module.type] = (acc[module.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-white">
                <MessageSquare className="h-6 w-6" />
              </div>
              Strategy Modules
            </h1>
            <p className="mt-2 text-muted-foreground">
              Browse all your AI-generated GTM strategy modules
            </p>
          </div>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => router.push("/onboarding")}
          >
            <Plus className="h-4 w-4" />
            New Strategy
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && <ModuleListSkeleton count={6} />}

        {/* Empty State */}
        {!isLoading && !hasModules && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>No Strategy Modules Yet</CardTitle>
                <CardDescription>
                  Create a GTM strategy to generate your first modules
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button onClick={() => router.push("/onboarding")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Strategy
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Modules Content */}
        {!isLoading && hasModules && (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">
                All Modules ({modules.length})
              </TabsTrigger>
              {Object.entries(MODULE_TYPE_INFO).map(([type, info]) => {
                const count = moduleCounts[type] || 0;
                if (count === 0) return null;
                return (
                  <TabsTrigger key={type} value={type} className="gap-2">
                    <info.icon className="h-4 w-4" />
                    {info.label} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredModules.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      No modules of this type yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-6">
                  {filteredModules.map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex flex-col gap-2">
                        {/* Workspace Context */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{module.companyName}</span>
                          <span>·</span>
                          <span>{module.workspaceName}</span>
                        </div>

                        {/* Module Content */}
                        <StrategyModuleView
                          module={module}
                          workspaceId={module.workspaceId}
                          editable={false}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
