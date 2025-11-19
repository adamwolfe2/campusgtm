"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { getWorkspaces, type WorkspaceWithModules } from "@/lib/storage/workspace-storage";

export default function DashboardPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithModules[]>([]);

  useEffect(() => {
    const loadedWorkspaces = getWorkspaces();
    setWorkspaces(loadedWorkspaces);
  }, []);

  const hasWorkspaces = workspaces.length > 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              The War Room
            </h1>
            <p className="text-muted-foreground">
              Your AI-powered GTM command center
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

        {/* Workspaces List */}
        {hasWorkspaces ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Your Workspaces</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="group cursor-pointer transition-all hover:border-primary hover:shadow-md"
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                      <CardTitle className="mt-4">{workspace.name}</CardTitle>
                      <CardDescription>{workspace.companyName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{workspace.modules.length} modules</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Updated {workspace.updatedAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* Getting Started - No Workspaces Yet */
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Complete these steps to set up your first GTM strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Complete Onboarding</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your company and goals
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a href="/onboarding">Start</a>
                </Button>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4 opacity-50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Generate Your Strategy</h3>
                  <p className="text-sm text-muted-foreground">
                    Let AI create your custom GTM plan
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Locked
                </Button>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4 opacity-50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Execute & Monitor</h3>
                  <p className="text-sm text-muted-foreground">
                    Track progress and refine your approach
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Locked
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategy Module Overview */}
        {hasWorkspaces && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Strategy Modules</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {strategyModules.map((module, index) => (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group cursor-pointer transition-all hover:border-primary hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${module.color} text-white`}
                        >
                          <module.icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                      <CardTitle className="mt-4">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {calculateModuleCount(workspaces, module.type)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const strategyModules = [
  {
    title: "Ambassador Playbook",
    description: "Design your 3-tier student ambassador program",
    icon: Users,
    color: "bg-blue-500",
    type: "ambassador_program",
  },
  {
    title: "Content Calendar",
    description: "4-week content strategy with AI-generated posts",
    icon: Calendar,
    color: "bg-green-500",
    type: "content_calendar",
  },
  {
    title: "Outreach Scripts",
    description: "Personalized outreach templates for your ICP",
    icon: MessageSquare,
    color: "bg-purple-500",
    type: "outreach_scripts",
  },
  {
    title: "ICP Definition",
    description: "Define your Ideal Customer Profile",
    icon: FileText,
    color: "bg-orange-500",
    type: "icp_definition",
  },
] as const;

function calculateModuleCount(
  workspaces: WorkspaceWithModules[],
  moduleType: string
): string {
  const count = workspaces.reduce((acc, workspace) => {
    return (
      acc + workspace.modules.filter((m) => m.type === moduleType).length
    );
  }, 0);

  return `${count} ${moduleType.replace("_", " ")}${count !== 1 ? "s" : ""}`;
}
