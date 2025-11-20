"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { monitorKeyword } from "@/app/actions/monitor-keywords";
import { toast } from "@/hooks/use-toast";
import { exportKeywordMentionsCSV } from "@/app/actions/export-data";
import { downloadCSV } from "@/lib/utils/download";
import { Download } from "lucide-react";

interface KeywordMention {
  platform: string;
  url: string;
  title: string;
  content: string;
  author: string;
  engagementScore: number;
  relevanceScore: number;
  suggestedReply: string;
  metadata: Record<string, any>;
}

export default function KeywordMonitoringPage() {
  const [keyword, setKeyword] = useState("");
  const [mentions, setMentions] = useState<KeywordMention[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Enter a keyword",
        description: "Please enter a keyword to monitor",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await monitorKeyword(keyword);
      setMentions(results);

      toast({
        title: "Search complete",
        description: `Found ${results.length} mentions of "${keyword}"`,
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

  const copyReply = (reply: string, index: number) => {
    navigator.clipboard.writeText(reply);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Reply copied successfully",
    });
  };

  const handleExportCSV = async () => {
    if (mentions.length === 0) {
      toast({
        title: "No data to export",
        description: "Search for keywords first",
        variant: "destructive",
      });
      return;
    }

    try {
      const csv = await exportKeywordMentionsCSV(mentions);
      const filename = `keyword-mentions-${keyword.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}`;
      downloadCSV(csv, filename);
      toast({
        title: "Export successful",
        description: `Exported ${mentions.length} mentions to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  const highPriorityMentions = mentions.filter(
    m => m.relevanceScore >= 70 && m.engagementScore >= 50
  );
  const mediumPriorityMentions = mentions.filter(
    m => m.relevanceScore >= 50 && m.relevanceScore < 70
  );
  const lowPriorityMentions = mentions.filter(m => m.relevanceScore < 50);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Keyword Monitoring</h1>
        <p className="text-muted-foreground">
          Find conversations where your ICP is discussing their problems
        </p>
      </motion.div>

      {/* Search Bar */}
      <Card className="p-6 mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Enter keyword to monitor (e.g., 'student ambassador', 'campus marketing')"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="text-base"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            size="lg"
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Quick searches:</span>
          {["student ambassador", "campus marketing", "university outreach"].map((q) => (
            <Button
              key={q}
              variant="outline"
              size="sm"
              onClick={() => {
                setKeyword(q);
                setTimeout(handleSearch, 100);
              }}
            >
              {q}
            </Button>
          ))}
        </div>
      </Card>

      {/* Results Stats */}
      {mentions.length > 0 && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highPriorityMentions.length}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mediumPriorityMentions.length}</p>
                <p className="text-sm text-muted-foreground">Medium Priority</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mentions.length}</p>
                <p className="text-sm text-muted-foreground">Total Mentions</p>
              </div>
            </div>
          </Card>
        </div>
        </>
      )}

      {/* Results Tabs */}
      {mentions.length > 0 ? (
        <Tabs defaultValue="high" className="w-full">
          <TabsList>
            <TabsTrigger value="high">
              High Priority ({highPriorityMentions.length})
            </TabsTrigger>
            <TabsTrigger value="medium">
              Medium Priority ({mediumPriorityMentions.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Mentions ({mentions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="high" className="mt-6">
            <MentionsList mentions={highPriorityMentions} copyReply={copyReply} copiedIndex={copiedIndex} />
          </TabsContent>

          <TabsContent value="medium" className="mt-6">
            <MentionsList mentions={mediumPriorityMentions} copyReply={copyReply} copiedIndex={copiedIndex} />
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <MentionsList mentions={mentions} copyReply={copyReply} copiedIndex={copiedIndex} />
          </TabsContent>
        </Tabs>
      ) : (
        !isSearching && (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No results yet</h3>
            <p className="text-muted-foreground">
              Enter a keyword above to start monitoring conversations
            </p>
          </Card>
        )
      )}
    </div>
  );
}

function MentionsList({
  mentions,
  copyReply,
  copiedIndex,
}: {
  mentions: KeywordMention[];
  copyReply: (reply: string, index: number) => void;
  copiedIndex: number | null;
}) {
  if (mentions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No mentions in this category</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {mentions.map((mention, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={mention.platform === "reddit" ? "default" : "secondary"}>
                    {mention.platform === "reddit" ? "Reddit" : "Hacker News"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    by u/{mention.author}
                  </span>
                  {mention.metadata.subreddit && (
                    <span className="text-sm text-muted-foreground">
                      in r/{mention.metadata.subreddit}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{mention.title}</h3>
              </div>

              <div className="flex gap-2">
                <Badge
                  variant={mention.relevanceScore >= 70 ? "destructive" : "outline"}
                >
                  {mention.relevanceScore}% relevant
                </Badge>
              </div>
            </div>

            {/* Content Preview */}
            {mention.content && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {mention.content}
              </p>
            )}

            {/* Metrics */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                <span>{mention.metadata.score || mention.metadata.points || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{mention.metadata.num_comments || 0} comments</span>
              </div>
            </div>

            {/* Suggested Reply */}
            {mention.suggestedReply && mention.suggestedReply !== "Skip - not relevant" && (
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium mb-2">💡 Suggested Reply:</p>
                <p className="text-sm">{mention.suggestedReply}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => window.open(mention.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                View Thread
              </Button>
              {mention.suggestedReply && mention.suggestedReply !== "Skip - not relevant" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => copyReply(mention.suggestedReply, index)}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Reply
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
