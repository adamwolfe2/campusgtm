"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  ExternalLink,
  Sparkles,
  Search,
  Copy,
  Download,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  analyzeTopPerformers,
  scoreContent,
  type ContentLeaderboard,
  type ContentScore,
} from "@/app/actions/analyze-content-performance";
import { toast } from "sonner";

const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "marketing", label: "Marketing" },
  { value: "education", label: "Education" },
  { value: "business", label: "Business" },
  { value: "design", label: "Design" },
  { value: "saas", label: "SaaS" },
];

const CONTENT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "question", label: "Question" },
  { value: "story", label: "Story" },
  { value: "how-to", label: "How-To Guide" },
  { value: "announcement", label: "Announcement" },
];

const TIMEFRAMES = [
  { value: "day", label: "Last 24 Hours" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
];

const GRADE_COLORS = {
  "A+": "bg-green-600",
  "A": "bg-green-500",
  "B": "bg-blue-500",
  "C": "bg-yellow-500",
  "D": "bg-red-500",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function ContentLeaderboardPage() {
  const [industry, setIndustry] = React.useState("technology");
  const [contentType, setContentType] = React.useState("all");
  const [timeframe, setTimeframe] = React.useState<'day' | 'week' | 'month'>("week");
  const [leaderboard, setLeaderboard] = React.useState<ContentLeaderboard[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [scoreUrl, setScoreUrl] = React.useState("");
  const [contentScore, setContentScore] = React.useState<ContentScore | null>(null);
  const [scoring, setScoring] = React.useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeTopPerformers({
        industry,
        contentType,
        timeframe,
      });
      setLeaderboard(result);
      toast.success(`Found ${result.length} top-performing posts`);
    } catch (error) {
      console.error("Error analyzing top performers:", error);
      toast.error("Failed to analyze top performers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreContent = async () => {
    if (!scoreUrl.trim()) {
      toast.error("Please enter a URL to analyze");
      return;
    }

    setScoring(true);
    try {
      const result = await scoreContent(scoreUrl);
      setContentScore(result);
      toast.success("Content analyzed successfully!");
    } catch (error) {
      console.error("Error scoring content:", error);
      toast.error("Failed to score content. Please check the URL and try again.");
    } finally {
      setScoring(false);
    }
  };

  const exportLeaderboard = () => {
    if (leaderboard.length === 0) return;

    const csvContent = [
      ["Rank", "Title", "Platform", "Engagement", "Score", "URL"],
      ...leaderboard.map((item) => [
        item.rank.toString(),
        item.title.replace(/,/g, ";"),
        item.platform,
        item.engagement.toString(),
        item.engagementScore.toString(),
        item.url,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-leaderboard-${industry}-${timeframe}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Leaderboard exported to CSV");
  };

  React.useEffect(() => {
    // Auto-load on mount
    handleAnalyze();
  }, []);

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
            <h1 className="text-3xl font-bold">Content Performance Leaderboard</h1>
            <p className="text-muted-foreground">
              Learn from top-performing content in your industry
            </p>
          </div>
          {leaderboard.length > 0 && (
            <Button onClick={exportLeaderboard} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Industry:</span>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind.value} value={ind.value}>
                    {ind.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Content Type:</span>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-[180px]">
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

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Timeframe:</span>
            <Select value={timeframe} onValueChange={(val) => setTimeframe(val as 'day' | 'week' | 'month')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAnalyze} disabled={loading} variant="default">
            <TrendingUp className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Score My Content Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Score My Content
              </CardTitle>
              <CardDescription>
                Analyze any URL to get performance insights and improvement suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/your-content"
                  value={scoreUrl}
                  onChange={(e) => setScoreUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleScoreContent();
                  }}
                />
                <Button onClick={handleScoreContent} disabled={scoring}>
                  {scoring ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              {/* Content Score Results */}
              {contentScore && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{contentScore.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {contentScore.url}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-white font-bold ${
                        GRADE_COLORS[contentScore.overallGrade]
                      }`}
                    >
                      {contentScore.overallGrade}
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid gap-3 mb-4">
                    {Object.entries(contentScore.breakdown).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{key}</span>
                          <span className="text-sm text-muted-foreground">{value}/100</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Scores */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Engagement Score</div>
                      <div className="text-2xl font-bold">{contentScore.engagementScore}/100</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Virality Potential</div>
                      <div className="text-2xl font-bold">{contentScore.viralityPotential}/100</div>
                    </div>
                  </div>

                  {/* What Worked */}
                  <div className="mb-4">
                    <h5 className="font-medium mb-2 text-green-600">What Worked</h5>
                    <ul className="space-y-1">
                      {contentScore.whatWorked.map((item, idx) => (
                        <li key={idx} className="text-sm flex gap-2">
                          <span className="text-green-600">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What Could Improve */}
                  <div>
                    <h5 className="font-medium mb-2 text-orange-600">What Could Improve</h5>
                    <ul className="space-y-1">
                      {contentScore.whatCouldImprove.map((item, idx) => (
                        <li key={idx} className="text-sm flex gap-2">
                          <span className="text-orange-600">→</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top 20 Performing Posts
              </CardTitle>
              <CardDescription>
                Learn from the highest-engagement content in {industry}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && leaderboard.length === 0 && (
                <div className="py-12 text-center">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No content found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or check back later
                  </p>
                </div>
              )}

              {!loading && leaderboard.length > 0 && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {leaderboard.map((item) => (
                    <motion.div key={item.rank} variants={itemVariants}>
                      <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        {/* Rank Badge */}
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${
                            item.rank === 1
                              ? "bg-yellow-500 text-white"
                              : item.rank === 2
                              ? "bg-gray-400 text-white"
                              : item.rank === 3
                              ? "bg-amber-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <span className="font-bold text-lg">{item.rank}</span>
                        </div>

                        {/* Content Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium line-clamp-2 flex-1">
                              {item.title}
                            </h4>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0"
                            >
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="secondary" className="capitalize">
                              {item.platform}
                            </Badge>
                            <Badge variant="outline">
                              {item.engagement.toLocaleString()} engagement
                            </Badge>
                            <Badge variant="outline">
                              Score: {item.engagementScore}/100
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                item.viralityPotential > 70
                                  ? "border-green-500 text-green-600"
                                  : item.viralityPotential > 40
                                  ? "border-yellow-500 text-yellow-600"
                                  : "border-red-500 text-red-600"
                              }
                            >
                              Virality: {item.viralityPotential}/100
                            </Badge>
                          </div>

                          {/* What Worked */}
                          <p className="text-sm text-muted-foreground">{item.whatWorked}</p>

                          {/* Metadata */}
                          {item.metadata && (
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {item.metadata.author && (
                                <span>by {item.metadata.author}</span>
                              )}
                              {item.metadata.subreddit && (
                                <span>in r/{item.metadata.subreddit}</span>
                              )}
                              {(item.metadata.score || item.metadata.points) && (
                                <span>
                                  {item.metadata.score || item.metadata.points} points
                                </span>
                              )}
                              {item.metadata.comments && (
                                <span>{item.metadata.comments} comments</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Replicate Button */}
                        <Button size="sm" variant="outline" className="shrink-0">
                          <Copy className="mr-2 h-4 w-4" />
                          Replicate
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
