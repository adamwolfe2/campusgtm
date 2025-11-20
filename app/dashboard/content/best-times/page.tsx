"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  TrendingUp,
  Download,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  analyzeBestTimes,
  generatePostingSchedule,
  type BestTimeAnalysis,
  type PostingSchedule,
} from "@/app/actions/analyze-posting-times";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "reddit", label: "Reddit" },
  { value: "hackernews", label: "Hacker News" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter/X" },
];

const CONTENT_TYPES = [
  { value: "question", label: "Question" },
  { value: "story", label: "Story" },
  { value: "how-to", label: "How-To Guide" },
  { value: "announcement", label: "Announcement" },
];

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function BestTimesPage() {
  const [platform, setPlatform] = React.useState("reddit");
  const [contentType, setContentType] = React.useState("question");
  const [targetAudience, setTargetAudience] = React.useState("B2B founders");
  const [postsPerWeek, setPostsPerWeek] = React.useState("3");
  const [loading, setLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<BestTimeAnalysis | null>(null);
  const [schedule, setSchedule] = React.useState<PostingSchedule | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeBestTimes({
        platform,
        contentType,
        targetAudience,
      });
      setAnalysis(result);

      // Generate schedule
      const scheduleResult = await generatePostingSchedule(
        "UTC",
        parseInt(postsPerWeek),
        result
      );
      setSchedule(scheduleResult);

      toast.success("Analysis complete! Check out your optimal posting times.");
    } catch (error) {
      console.error("Error analyzing posting times:", error);
      toast.error("Failed to analyze posting times. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (engagement: number, maxEngagement: number): string => {
    const ratio = maxEngagement > 0 ? engagement / maxEngagement : 0;

    if (ratio > 0.7) return "bg-green-500";
    if (ratio > 0.4) return "bg-yellow-500";
    if (ratio > 0.2) return "bg-orange-400";
    return "bg-red-400";
  };

  const exportSchedule = () => {
    if (!schedule) return;

    const csvContent = [
      ["Day", "Time (UTC)", "Expected Engagement"],
      ...schedule.slots.map((slot) => [
        slot.dayOfWeek,
        slot.time,
        slot.expectedEngagement.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `posting-schedule-${platform}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Schedule exported to CSV");
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-card px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Best Times to Post</h1>
            <p className="text-muted-foreground">
              Find optimal posting times based on historical engagement data
            </p>
          </div>
          {schedule && (
            <Button onClick={exportSchedule} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Schedule
            </Button>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Settings</CardTitle>
              <CardDescription>
                Configure your content and audience to find the best posting times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger id="contentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((ct) => (
                        <SelectItem key={ct.value} value={ct.value}>
                          {ct.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., B2B founders, college students"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postsPerWeek">Posts Per Week</Label>
                  <Input
                    id="postsPerWeek"
                    type="number"
                    min="1"
                    max="14"
                    value={postsPerWeek}
                    onChange={(e) => setPostsPerWeek(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-4 w-full"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analyze Best Times
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          {!loading && analysis && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Summary Stats */}
              <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Sample Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.sampleSize}</div>
                    <p className="text-xs text-muted-foreground">posts analyzed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.avgEngagement}</div>
                    <p className="text-xs text-muted-foreground">at optimal times</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          analysis.confidence === "high"
                            ? "default"
                            : analysis.confidence === "medium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {analysis.confidence.toUpperCase()}
                      </Badge>
                      {analysis.confidence === "low" && (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analysis.confidence === "high"
                        ? "Strong data confidence"
                        : analysis.confidence === "medium"
                        ? "Moderate data confidence"
                        : "Limited data available"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Heatmap */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Heatmap</CardTitle>
                    <CardDescription>
                      Darker green = higher engagement (UTC timezone)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full">
                        {/* Hour labels */}
                        <div className="flex">
                          <div className="w-24 shrink-0" /> {/* Day label space */}
                          {Array.from({ length: 24 }, (_, i) => (
                            <div
                              key={i}
                              className="w-8 text-center text-xs text-muted-foreground"
                            >
                              {i}
                            </div>
                          ))}
                        </div>

                        {/* Heatmap rows */}
                        {DAYS_OF_WEEK.map((day) => {
                          const dayData = analysis.heatmapData.filter((d) => d.day === day);
                          const maxEngagement = Math.max(
                            ...analysis.heatmapData.map((d) => d.engagement),
                            1
                          );

                          return (
                            <div key={day} className="flex items-center">
                              <div className="w-24 shrink-0 text-sm font-medium pr-2">
                                {day.substring(0, 3)}
                              </div>
                              {Array.from({ length: 24 }, (_, hour) => {
                                const cellData = dayData.find((d) => d.hour === hour);
                                const engagement = cellData?.engagement || 0;
                                const color = getHeatmapColor(engagement, maxEngagement);
                                const isOptimal = analysis.bestHours.includes(hour) &&
                                                  analysis.bestDays.includes(day);

                                return (
                                  <div
                                    key={hour}
                                    className={`w-8 h-8 m-0.5 rounded ${
                                      engagement > 0 ? color : "bg-muted"
                                    } ${
                                      isOptimal ? "ring-2 ring-primary" : ""
                                    } transition-all hover:scale-110 cursor-pointer`}
                                    title={`${day} ${hour}:00 - ${engagement} engagement`}
                                  />
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <span className="text-muted-foreground">Low</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 bg-red-400 rounded" />
                        <div className="w-4 h-4 bg-orange-400 rounded" />
                        <div className="w-4 h-4 bg-yellow-500 rounded" />
                        <div className="w-4 h-4 bg-green-500 rounded" />
                      </div>
                      <span className="text-muted-foreground">High</span>
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-4 h-4 bg-muted rounded ring-2 ring-primary" />
                        <span className="text-muted-foreground">Optimal time</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Times */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 Best Times</CardTitle>
                    <CardDescription>Highest engagement windows (UTC)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.bestHours.map((hour, idx) => (
                        <div
                          key={hour}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-medium">
                                {hour.toString().padStart(2, '0')}:00 - {(hour + 1).toString().padStart(2, '0')}:00
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening"}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">
                            <Clock className="mr-1 h-3 w-3" />
                            Peak time
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Best Days</h4>
                      <div className="flex gap-2">
                        {analysis.bestDays.map((day) => (
                          <Badge key={day} variant="secondary">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Insights */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Insights & Recommendations</CardTitle>
                    <CardDescription>
                      Why these times work for your audience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysis.insights.map((insight, idx) => (
                        <li key={idx} className="flex gap-3">
                          <Sparkles className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                          <span className="text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recommended Schedule */}
              {schedule && (
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Posting Schedule</CardTitle>
                      <CardDescription>
                        Your personalized {postsPerWeek}-post weekly schedule
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {schedule.slots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{slot.dayOfWeek}</div>
                                <div className="text-sm text-muted-foreground">
                                  {slot.time} UTC
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {slot.expectedEngagement}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                expected engagement
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
