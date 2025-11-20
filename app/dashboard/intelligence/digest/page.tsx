"use client";

import * as React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Search,
  Zap,
  RefreshCw,
  Mail,
  ChevronLeft,
  ChevronRight,
  Target,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  generateWeeklyDigestForWorkspace,
  exportDigestEmail,
  type WeeklyDigest,
} from "@/app/actions/weekly-digest";
import { sendWeeklyDigestEmail } from "@/app/actions/send-email";
import { exportWeeklyDigestCSV } from "@/app/actions/export-data";
import { downloadCSV, downloadHTML } from "@/lib/utils/download";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function WeeklyDigestPage() {
  const [digest, setDigest] = React.useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [weekOffset, setWeekOffset] = React.useState(0); // 0 = current week, -1 = last week
  const [sendingEmail, setSendingEmail] = React.useState(false);
  const [emailRecipient, setEmailRecipient] = React.useState("");
  const [showEmailInput, setShowEmailInput] = React.useState(false);

  // Load digest on mount and when week changes
  React.useEffect(() => {
    loadDigest();
  }, [weekOffset]);

  const loadDigest = async () => {
    try {
      setLoading(true);
      // In production, get actual workspace ID
      const workspaceId = "demo-workspace";
      const weeklyDigest = await generateWeeklyDigestForWorkspace(workspaceId, weekOffset);
      setDigest(weeklyDigest);
    } catch (error) {
      console.error('Failed to load weekly digest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await loadDigest();
    setGenerating(false);
  };

  const handleExportEmail = async () => {
    if (!digest) return;

    try {
      const html = await exportDigestEmail(digest);
      const filename = `weekly-digest-${digest.weekStart.toISOString().split('T')[0]}`;
      downloadHTML(html, filename);
      toast.success('Email HTML exported successfully');
    } catch (error) {
      console.error('Failed to export email:', error);
      toast.error('Failed to export email HTML');
    }
  };

  const handleExportCSV = async () => {
    if (!digest) return;

    try {
      const csv = await exportWeeklyDigestCSV(digest);
      const filename = `weekly-digest-${digest.weekStart.toISOString().split('T')[0]}`;
      downloadCSV(csv, filename);
      toast.success('Digest exported to CSV');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleSendEmail = async () => {
    if (!digest || !emailRecipient.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      const result = await sendWeeklyDigestEmail(emailRecipient, digest);

      if (result.success) {
        toast.success(result.message);
        setEmailRecipient("");
        setShowEmailInput(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePreviousWeek = () => setWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setWeekOffset(prev => Math.min(prev + 1, 0));

  const formatWeekRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading weekly digest...</p>
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No digest available</p>
          <Button onClick={handleGenerate}>Generate Digest</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatWeekRange(digest.weekStart, digest.weekEnd)}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextWeek}
                disabled={weekOffset >= 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
              >
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportEmail}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download HTML
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowEmailInput(!showEmailInput)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Growth Digest</h1>
            <p className="text-muted-foreground mt-1">
              AI-generated executive summary of this week's growth intelligence
            </p>
          </div>
        </div>

        {/* Email Input Section */}
        {showEmailInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex gap-2"
          >
            <Input
              type="email"
              placeholder="Enter email address"
              value={emailRecipient}
              onChange={(e) => setEmailRecipient(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
              className="max-w-sm"
            />
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail || !emailRecipient.trim()}
            >
              {sendingEmail ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowEmailInput(false);
                setEmailRecipient("");
              }}
            >
              Cancel
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <MetricCard
          icon={Users}
          label="Communities Found"
          value={digest.metrics.communitiesFound}
          color="text-blue-600"
        />
        <MetricCard
          icon={Search}
          label="Keyword Mentions"
          value={digest.metrics.totalMentions}
          color="text-purple-600"
        />
        <MetricCard
          icon={Zap}
          label="Viral Content"
          value={digest.metrics.viralContentDiscovered}
          color="text-orange-600"
        />
        <MetricCard
          icon={Target}
          label="Competitor Changes"
          value={digest.metrics.competitorChanges}
          color="text-red-600"
        />
        <MetricCard
          icon={TrendingUp}
          label="Actions Completed"
          value={digest.metrics.actionsCompleted}
          color="text-green-600"
        />
        <MetricCard
          icon={BarChart3}
          label="Keywords Monitored"
          value={digest.metrics.keywordsMonitored}
          color="text-indigo-600"
        />
      </motion.div>

      {/* AI-Generated Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Executive Summary
            </CardTitle>
            <CardDescription>
              AI-analyzed insights from the week's intelligence data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{digest.summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Opportunities */}
      {digest.topOpportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Top Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {digest.topOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">
                      {opportunity.type}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{opportunity.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {opportunity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Insights Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Competitive Insights */}
        {digest.competitiveInsights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Competitive Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {digest.competitiveInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Content Trends */}
        {digest.contentTrends.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {digest.contentTrends.map((trend, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{trend}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Next Week Focus */}
      {digest.nextWeekFocus.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Next Week's Focus
              </CardTitle>
              <CardDescription>
                Recommended priorities for the week ahead
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {digest.nextWeekFocus.map((focus, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm mt-0.5">{focus}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Previous Digests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Previous Digests</CardTitle>
            <CardDescription>
              Access digests from previous weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[-1, -2, -3, -4].map((offset) => {
                const start = new Date();
                const dayOfWeek = start.getDay();
                const weekStart = new Date(start);
                weekStart.setDate(start.getDate() - dayOfWeek + (offset * 7));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);

                return (
                  <button
                    key={offset}
                    onClick={() => setWeekOffset(offset)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left",
                      weekOffset === offset
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formatWeekRange(weekStart, weekEnd)}
                      </span>
                    </div>
                    {weekOffset === offset && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Metric card component
 */
function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center", color)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
