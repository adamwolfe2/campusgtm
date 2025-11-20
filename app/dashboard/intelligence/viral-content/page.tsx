"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Search,
  ExternalLink,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { findViralContent, quickSearchViral, type ViralContent } from "@/app/actions/find-viral-content";
import { toast } from "@/hooks/use-toast";

export default function ViralContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [industry, setIndustry] = useState("technology");
  const [contentType, setContentType] = useState("all");
  const [minEngagement, setMinEngagement] = useState([50]);
  const [viralContent, setViralContent] = useState<ViralContent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await findViralContent({
        industry,
        contentType,
        minEngagement: minEngagement[0],
      });

      setViralContent(results);

      toast({
        title: "Search complete",
        description: `Found ${results.length} viral posts`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a search query",
        description: "Please enter a topic to search for",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await quickSearchViral(searchQuery, minEngagement[0]);
      setViralContent(results);

      toast({
        title: "Search complete",
        description: `Found ${results.length} viral posts about "${searchQuery}"`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const redditContent = viralContent.filter((c) => c.platform === "reddit");
  const hnContent = viralContent.filter((c) => c.platform === "hackernews");

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Viral Content Finder</h1>
        <p className="text-muted-foreground">
          Discover trending content in your niche and learn what makes it go viral
        </p>
      </motion.div>

      {/* Search Controls */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          {/* Quick Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Quick Search
            </label>
            <div className="flex gap-3">
              <Input
                placeholder="Search for specific topics (e.g., 'student marketing', 'viral campaigns')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
                className="text-base"
              />
              <Button
                onClick={handleQuickSearch}
                disabled={isSearching}
                size="lg"
                className="gap-2 min-w-[140px]"
              >
                <Search className="h-4 w-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or browse by industry
              </span>
            </div>
          </div>

          {/* Industry Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Industry
              </label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Content Type
              </label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="post">Text Posts</SelectItem>
                  <SelectItem value="discussion">Discussions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Min Engagement: {minEngagement[0]}
              </label>
              <Slider
                value={minEngagement}
                onValueChange={setMinEngagement}
                min={10}
                max={500}
                step={10}
                className="mt-2"
              />
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching}
            size="lg"
            className="w-full gap-2"
            variant="secondary"
          >
            <Filter className="h-4 w-4" />
            {isSearching ? "Finding Viral Content..." : "Find Viral Content"}
          </Button>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Quick topics:</span>
          {["viral marketing", "growth hacking", "student ambassador", "campus events"].map(
            (q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(q);
                  setTimeout(handleQuickSearch, 100);
                }}
              >
                {q}
              </Button>
            )
          )}
        </div>
      </Card>

      {/* Results Stats */}
      {viralContent.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{viralContent.length}</p>
                <p className="text-sm text-muted-foreground">Total Viral Posts</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{redditContent.length}</p>
                <p className="text-sm text-muted-foreground">Reddit Posts</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{hnContent.length}</p>
                <p className="text-sm text-muted-foreground">HackerNews Stories</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Results Tabs */}
      {viralContent.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({viralContent.length})</TabsTrigger>
            <TabsTrigger value="reddit">Reddit ({redditContent.length})</TabsTrigger>
            <TabsTrigger value="hackernews">HackerNews ({hnContent.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ViralContentList
              content={viralContent}
              expandedCards={expandedCards}
              toggleExpanded={toggleExpanded}
            />
          </TabsContent>

          <TabsContent value="reddit" className="mt-6">
            <ViralContentList
              content={redditContent}
              expandedCards={expandedCards}
              toggleExpanded={toggleExpanded}
            />
          </TabsContent>

          <TabsContent value="hackernews" className="mt-6">
            <ViralContentList
              content={hnContent}
              expandedCards={expandedCards}
              toggleExpanded={toggleExpanded}
            />
          </TabsContent>
        </Tabs>
      ) : (
        !isSearching && (
          <Card className="p-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No results yet</h3>
            <p className="text-muted-foreground">
              Search for topics or browse by industry to discover viral content
            </p>
          </Card>
        )
      )}
    </div>
  );
}

function ViralContentList({
  content,
  expandedCards,
  toggleExpanded,
}: {
  content: ViralContent[];
  expandedCards: Set<number>;
  toggleExpanded: (index: number) => void;
}) {
  if (content.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No content found</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {content.map((item, index) => {
        const isExpanded = expandedCards.has(index);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant={
                        item.platform === "reddit" ? "default" : "secondary"
                      }
                    >
                      {item.platform === "reddit" ? "Reddit" : "HackerNews"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      by {item.author}
                    </span>
                    {item.metadata.subreddit && (
                      <span className="text-sm font-medium text-muted-foreground">
                        r/{item.metadata.subreddit}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">
                    {item.title}
                  </h3>
                </div>

                <Badge variant="outline" className="ml-4 gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {item.engagementScore}
                </Badge>
              </div>

              {/* Content Preview */}
              {item.content && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.content}
                </p>
              )}

              {/* Metrics */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {item.metadata.score || item.metadata.points || 0} upvotes
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>{item.metadata.num_comments || 0} comments</span>
                </div>
              </div>

              {/* Why It Worked - Always Visible */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 mb-4 border border-purple-500/20">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                      Why It Went Viral
                    </p>
                    <p className="text-sm leading-relaxed">{item.whyViral}</p>
                  </div>
                </div>
              </div>

              {/* Expandable Actionable Takeaways */}
              {item.contentIdeas.length > 0 && (
                <div className="mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(index)}
                    className="w-full justify-between hover:bg-muted/50"
                  >
                    <span className="font-semibold text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Actionable Takeaways ({item.contentIdeas.length})
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 bg-muted/30 rounded-lg p-4"
                    >
                      <ul className="space-y-2">
                        {item.contentIdeas.map((idea, ideaIndex) => (
                          <li
                            key={ideaIndex}
                            className="text-sm flex items-start gap-2"
                          >
                            <span className="text-primary font-bold shrink-0">
                              {ideaIndex + 1}.
                            </span>
                            <span>{idea}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(item.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    toast({
                      title: "Bookmarked",
                      description: "Content saved for later",
                    });
                  }}
                >
                  <Bookmark className="h-4 w-4" />
                  Bookmark
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
