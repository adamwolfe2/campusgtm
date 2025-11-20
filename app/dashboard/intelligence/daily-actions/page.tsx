"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CheckSquare,
  MessageSquare,
  Users,
  Eye,
  FileText,
  TrendingUp,
  Clock,
  BarChart3,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  generateDailyActionsFromWorkspace,
  type DailyAction,
  ActionType,
  ActionPriority,
} from "@/app/actions/daily-actions";

const actionTypeIcons = {
  engage_thread: MessageSquare,
  join_community: Users,
  monitor_competitor: Eye,
  publish_content: FileText,
  analyze_viral: TrendingUp,
} as const;

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
} as const;

const priorityTextColors = {
  high: "text-red-700 bg-red-50 border-red-200",
  medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
  low: "text-green-700 bg-green-50 border-green-200",
} as const;

export default function DailyActionsPage() {
  const [actions, setActions] = React.useState<DailyAction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [regenerating, setRegenerating] = React.useState(false);

  // Load actions on mount
  React.useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      setLoading(true);
      // In production, get actual workspace ID
      const workspaceId = "demo-workspace";
      const dailyActions = await generateDailyActionsFromWorkspace(workspaceId);
      setActions(dailyActions);
    } catch (error) {
      console.error('Failed to load daily actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    await loadActions();
    setRegenerating(false);
  };

  const toggleComplete = (actionId: string) => {
    setActions(prev =>
      prev.map(action =>
        action.id === actionId
          ? { ...action, completed: !action.completed }
          : action
      )
    );
  };

  const completedCount = actions.filter(a => a.completed).length;
  const totalCount = actions.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Mock stats - in production, fetch from database
  const weeklyStats = {
    totalActionsThisWeek: 28,
    completionRate: 76,
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your daily actions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Daily GTM Actions</h1>
              <p className="text-muted-foreground mt-1">{today}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCount}/{totalCount} Completed
            </div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.totalActionsThisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total actions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average this week
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Today's Top 5 Actions</h2>
          <Button variant="link" size="sm" asChild>
            <a href="/dashboard/intelligence/digest">
              View Weekly Digest
              <ExternalLink className="ml-2 h-3 w-3" />
            </a>
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ActionCard
                action={action}
                onToggleComplete={() => toggleComplete(action.id)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Individual action card component
 */
function ActionCard({
  action,
  onToggleComplete,
}: {
  action: DailyAction;
  onToggleComplete: () => void;
}) {
  const Icon = actionTypeIcons[action.type];

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      action.completed && "opacity-60"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={onToggleComplete}
            className={cn(
              "mt-1 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
              action.completed
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary"
            )}
            aria-label={action.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {action.completed && <CheckSquare className="h-4 w-4" />}
          </button>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  "bg-primary/10 text-primary"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className={cn(
                    "font-semibold text-base",
                    action.completed && "line-through"
                  )}>
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Priority Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0",
                  priorityTextColors[action.priority]
                )}
              >
                <div className={cn(
                  "mr-1.5 h-2 w-2 rounded-full",
                  priorityColors[action.priority]
                )} />
                {action.priority}
              </Badge>
            </div>

            <Separator />

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{action.estimatedTime}</span>
                </div>
                {action.sourceType && (
                  <Badge variant="secondary" className="text-xs">
                    {action.sourceType.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={action.completed}
              >
                <a href={action.url} target="_blank" rel="noopener noreferrer">
                  Take Action
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
