"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  Loader2,
  Building2,
  ExternalLink,
} from "lucide-react";
import { getWorkspaces, type WorkspaceWithModules } from "@/lib/database/workspace-service";
import { toast } from "sonner";

export default function WorkspacesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithModules[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setIsLoading(true);
        const loadedWorkspaces = await getWorkspaces(user?.id);
        setWorkspaces(loadedWorkspaces);
      } catch (err) {
        console.error("Failed to load workspaces:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load workspaces"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaces();
  }, [user?.id]);

  const hasWorkspaces = workspaces.length > 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Your Workspaces
            </h1>
            <p className="text-muted-foreground">
              Manage all your GTM strategy workspaces
            </p>
          </div>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => router.push("/onboarding")}
          >
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasWorkspaces && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>No workspaces yet</CardTitle>
                <CardDescription>
                  Create your first GTM strategy workspace to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button onClick={() => router.push("/onboarding")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Workspace
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Workspaces Grid */}
        {!isLoading && hasWorkspaces && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace, index) => (
              <motion.div
                key={workspace.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="group cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                  onClick={() => router.push(`/workspace/${workspace.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <CardTitle className="mt-4 line-clamp-1">{workspace.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {workspace.companyName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      {/* Company URL */}
                      {workspace.companyUrl && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <a
                            href={workspace.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate hover:text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {workspace.companyUrl.replace(/^https?:\/\//,'')}
                          </a>
                        </div>
                      )}

                      {/* Modules Count */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>
                          {workspace.modules.length} strategy module{workspace.modules.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Last Updated */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Updated {workspace.updatedAt.toLocaleDateString()}
                        </span>
                      </div>

                      {/* AI Strategy Badge */}
                      {workspace.generatedStrategy && (
                        <div className="mt-2 flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          <Sparkles className="h-3 w-3" />
                          AI-Generated Strategy
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
