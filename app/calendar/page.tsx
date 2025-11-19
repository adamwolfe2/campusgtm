"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StrategyModuleView } from "@/components/strategy-module-view";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Plus,
  Loader2,
  Building2,
} from "lucide-react";
import { getWorkspaces, type WorkspaceWithModules } from "@/lib/database/workspace-service";
import { StrategyModuleType } from "@/types";
import type { StrategyModule } from "@/types";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ContentCalendarWithWorkspace extends StrategyModule {
  workspaceName: string;
  companyName: string;
}

export default function ContentCalendarPage() {
  const router = useRouter();
  const { user } = useUser();
  const [calendars, setCalendars] = useState<ContentCalendarWithWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCalendars = async () => {
      try {
        setIsLoading(true);
        const workspaces = await getWorkspaces(user?.id);

        // Extract all content calendar modules from all workspaces
        const contentCalendars: ContentCalendarWithWorkspace[] = [];

        workspaces.forEach((workspace) => {
          workspace.modules
            .filter((module) => module.type === StrategyModuleType.CONTENT_CALENDAR)
            .forEach((module) => {
              contentCalendars.push({
                ...module,
                workspaceName: workspace.name,
                companyName: workspace.companyName,
              });
            });
        });

        setCalendars(contentCalendars);
      } catch (err) {
        console.error("Failed to load content calendars:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load content calendars"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendars();
  }, [user?.id]);

  const hasCalendars = calendars.length > 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white">
                <CalendarIcon className="h-6 w-6" />
              </div>
              Content Calendars
            </h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your AI-generated content strategies
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
        {isLoading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasCalendars && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CalendarIcon className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle>No Content Calendars Yet</CardTitle>
                <CardDescription>
                  Create a GTM strategy to generate your first content calendar
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

        {/* Content Calendars List */}
        {!isLoading && hasCalendars && (
          <div className="flex flex-col gap-6">
            {calendars.map((calendar, index) => (
              <motion.div
                key={calendar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex flex-col gap-2">
                  {/* Workspace Context */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{calendar.companyName}</span>
                    <span>·</span>
                    <span>{calendar.workspaceName}</span>
                  </div>

                  {/* Module Content */}
                  <StrategyModuleView
                    module={calendar}
                    workspaceId={calendar.workspaceId}
                    editable={false}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
