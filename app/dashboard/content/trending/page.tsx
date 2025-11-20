"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Users,
  ExternalLink,
  Sparkles,
  Filter,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { findTrendingTopics, type TrendingTopic } from "@/app/actions/find-trending-topics";
import { toast } from "sonner";

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

const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "marketing", label: "Marketing" },
  { value: "education", label: "Education" },
  { value: "business", label: "Business" },
  { value: "design", label: "Design" },
  { value: "saas", label: "SaaS" },
];

const TIMEFRAMES = [
  { value: "day", label: "Last 24 Hours" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
];

const MOMENTUM_CONFIG = {
  rising: {
    icon: TrendingUp,
    label: "Rising",
    color: "text-green-600",
    bg: "bg-green-100",
    emoji: "🔥",
  },
  peaking: {
    icon: Activity,
    label: "Peaking",
    color: "text-blue-600",
    bg: "bg-blue-100",
    emoji: "📈",
  },
  declining: {
    icon: TrendingDown,
    label: "Declining",
    color: "text-orange-600",
    bg: "bg-orange-100",
    emoji: "📉",
  },
};

const SATURATION_CONFIG = {
  low: { label: "Low Saturation", color: "bg-green-500" },
  medium: { label: "Medium Saturation", color: "bg-yellow-500" },
  high: { label: "High Saturation", color: "bg-red-500" },
};

export default function TrendingTopicsPage() {
  const [industry, setIndustry] = React.useState("technology");
  const [timeframe, setTimeframe] = React.useState<'day' | 'week' | 'month'>("week");
  const [topics, setTopics] = React.useState<TrendingTopic[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [expandedTopics, setExpandedTopics] = React.useState<Set<string>>(new Set());

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await findTrendingTopics({ industry, timeframe });
      setTopics(result);
      toast.success(`Found ${result.length} trending topics in ${industry}`);
    } catch (error) {
      console.error("Error finding trending topics:", error);
      toast.error("Failed to find trending topics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (topic: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topic)) {
      newExpanded.delete(topic);
    } else {
      newExpanded.add(topic);
    }
    setExpandedTopics(newExpanded);
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
            <h1 className="text-3xl font-bold">Trending Topics</h1>
            <p className="text-muted-foreground">
              Discover what's trending across Reddit, HackerNews, and the web
            </p>
          </div>
          <Button onClick={handleAnalyze} disabled={loading}>
            <Filter className="mr-2 h-4 w-4" />
            Refresh
          </Button>
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
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && topics.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No trending topics found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or check back later
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && topics.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {topics.map((topic, index) => {
              const momentumConfig = MOMENTUM_CONFIG[topic.momentum];
              const saturationConfig = SATURATION_CONFIG[topic.saturationLevel];
              const isExpanded = expandedTopics.has(topic.topic);

              return (
                <motion.div key={topic.topic} variants={itemVariants}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">{momentumConfig.emoji}</span>
                            <span>{topic.topic}</span>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {topic.keywords.join(" • ")}
                          </CardDescription>
                        </div>

                        <div className={`rounded-full p-2 ${momentumConfig.bg}`}>
                          <momentumConfig.icon className={`h-5 w-5 ${momentumConfig.color}`} />
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary">
                          {momentumConfig.label}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {topic.postCount} posts
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Activity className="h-3 w-3" />
                          {topic.totalEngagement.toLocaleString()} engagement
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {topic.shelfLife}
                        </Badge>
                      </div>

                      {/* Platforms */}
                      <div className="flex gap-2 mt-2">
                        {topic.platforms.map((platform) => (
                          <Badge key={platform} className="capitalize">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Saturation Level */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Saturation Level</span>
                          <span className="text-sm text-muted-foreground">
                            {saturationConfig.label}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${saturationConfig.color}`}
                            style={{
                              width:
                                topic.saturationLevel === "low"
                                  ? "33%"
                                  : topic.saturationLevel === "medium"
                                  ? "66%"
                                  : "100%",
                            }}
                          />
                        </div>
                      </div>

                      {/* Top Posts */}
                      {topic.topPosts.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Top Posts</h4>
                          <div className="space-y-2">
                            {topic.topPosts.map((post, idx) => (
                              <a
                                key={idx}
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-2 text-sm p-2 rounded hover:bg-muted transition-colors"
                              >
                                <Badge variant="outline" className="shrink-0 capitalize">
                                  {post.platform}
                                </Badge>
                                <span className="flex-1 line-clamp-2">{post.title}</span>
                                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Angles */}
                      <div>
                        <button
                          onClick={() => toggleExpanded(topic.topic)}
                          className="text-sm font-medium hover:underline w-full text-left"
                        >
                          {isExpanded ? "Hide" : "Show"} Suggested Angles ({topic.suggestedAngles.length})
                        </button>

                        {isExpanded && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-2"
                          >
                            {topic.suggestedAngles.map((angle, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-primary">•</span>
                                <span>{angle}</span>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Create Content
                        </Button>
                        <Button variant="ghost" size="sm">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
