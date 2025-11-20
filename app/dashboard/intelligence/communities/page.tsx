"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  ExternalLink,
  TrendingUp,
  Clock,
  Target,
  Briefcase,
  Building2,
  Heart,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { findCommunitiesForICP, quickFindCommunities, type CommunityResult } from "@/app/actions/find-communities";
import { toast } from "@/hooks/use-toast";
import { exportCommunitiesCSV } from "@/app/actions/export-data";
import { downloadCSV } from "@/lib/utils/download";
import { Download } from "lucide-react";

export default function CommunityFinderPage() {
  const [communities, setCommunities] = useState<CommunityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // ICP Form State
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [goals, setGoals] = useState("");

  // Quick search state
  const [quickSearch, setQuickSearch] = useState("");

  const handleDeepSearch = async () => {
    if (!jobTitle && !industry) {
      toast({
        title: "Add ICP details",
        description: "Please provide at least a job title or industry",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await findCommunitiesForICP({
        title: jobTitle,
        industry,
        companySize,
        painPoints: painPoints ? painPoints.split(",").map(p => p.trim()) : [],
        goals: goals ? goals.split(",").map(g => g.trim()) : [],
      });

      setCommunities(results);

      toast({
        title: "Search complete",
        description: `Found ${results.length} communities for your ICP`,
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
    if (!quickSearch.trim()) {
      toast({
        title: "Enter search terms",
        description: "Please enter an industry or job title",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const [industryTerm, titleTerm] = quickSearch.includes(" ")
        ? quickSearch.split(" ", 2)
        : [quickSearch, quickSearch];

      const results = await quickFindCommunities(industryTerm, titleTerm);

      setCommunities(results);

      toast({
        title: "Quick search complete",
        description: `Found ${results.length} Reddit communities`,
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

  const handleExportCSV = async () => {
    if (communities.length === 0) {
      toast({
        title: "No data to export",
        description: "Search for communities first",
        variant: "destructive",
      });
      return;
    }

    try {
      const csv = await exportCommunitiesCSV(communities);
      const filename = `communities-${new Date().toISOString().split('T')[0]}`;
      downloadCSV(csv, filename);
      toast({
        title: "Export successful",
        description: `Exported ${communities.length} communities to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  const platformGroups = {
    reddit: communities.filter(c => c.platform === "reddit"),
    linkedin: communities.filter(c => c.platform === "linkedin"),
    slack: communities.filter(c => c.platform === "slack"),
    discord: communities.filter(c => c.platform === "discord"),
    other: communities.filter(c => !["reddit", "linkedin", "slack", "discord"].includes(c.platform)),
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">ICP Community Finder</h1>
        </div>
        <p className="text-muted-foreground">
          AI-powered search to find where your ideal customers hang out online
        </p>
      </motion.div>

      {/* Search Tabs */}
      <Tabs defaultValue="deep" className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="deep">
            <Sparkles className="h-4 w-4 mr-2" />
            Deep Search
          </TabsTrigger>
          <TabsTrigger value="quick">
            <Search className="h-4 w-4 mr-2" />
            Quick Search
          </TabsTrigger>
        </TabsList>

        {/* Deep Search (AI-Powered) */}
        <TabsContent value="deep">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Title
                </label>
                <Input
                  placeholder="e.g., Marketing Director"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Industry
                </label>
                <Input
                  placeholder="e.g., B2B SaaS"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Company Size
                </label>
                <Input
                  placeholder="e.g., 10-50 employees"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goals (comma-separated)
                </label>
                <Input
                  placeholder="e.g., grow revenue, automate marketing"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Pain Points (comma-separated)
                </label>
                <Input
                  placeholder="e.g., manual processes, low conversion rates"
                  value={painPoints}
                  onChange={(e) => setPainPoints(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleDeepSearch}
              disabled={isSearching}
              size="lg"
              className="w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isSearching ? "Searching across platforms..." : "Find Communities with AI"}
            </Button>

            <p className="text-xs text-muted-foreground mt-3 text-center">
              AI will search Reddit, LinkedIn, Slack, Discord, and forums
            </p>
          </Card>
        </TabsContent>

        {/* Quick Search */}
        <TabsContent value="quick">
          <Card className="p-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter industry or job title (e.g., 'SaaS marketing')"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
                  className="text-base"
                />
              </div>
              <Button
                onClick={handleQuickSearch}
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
              {["B2B SaaS", "startup founders", "growth marketing", "student ambassadors"].map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuickSearch(q);
                    setTimeout(handleQuickSearch, 100);
                  }}
                >
                  {q}
                </Button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Searches Reddit only for faster results
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Stats */}
      {communities.length > 0 && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{platformGroups.reddit.length}</p>
                <p className="text-sm text-muted-foreground">Reddit</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{platformGroups.linkedin.length}</p>
                <p className="text-sm text-muted-foreground">LinkedIn</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{platformGroups.slack.length + platformGroups.discord.length}</p>
                <p className="text-sm text-muted-foreground">Slack/Discord</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{communities.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>
        </div>
        </>
      )}

      {/* Results */}
      {communities.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({communities.length})</TabsTrigger>
            <TabsTrigger value="reddit">Reddit ({platformGroups.reddit.length})</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn ({platformGroups.linkedin.length})</TabsTrigger>
            <TabsTrigger value="other">Other ({platformGroups.slack.length + platformGroups.discord.length + platformGroups.other.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <CommunityGrid communities={communities} />
          </TabsContent>

          <TabsContent value="reddit" className="mt-6">
            <CommunityGrid communities={platformGroups.reddit} />
          </TabsContent>

          <TabsContent value="linkedin" className="mt-6">
            <CommunityGrid communities={platformGroups.linkedin} />
          </TabsContent>

          <TabsContent value="other" className="mt-6">
            <CommunityGrid communities={[...platformGroups.slack, ...platformGroups.discord, ...platformGroups.other]} />
          </TabsContent>
        </Tabs>
      ) : (
        !isSearching && (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No communities found yet</h3>
            <p className="text-muted-foreground">
              Use the search above to find communities where your ICP hangs out
            </p>
          </Card>
        )
      )}
    </div>
  );
}

function CommunityGrid({ communities }: { communities: CommunityResult[] }) {
  if (communities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No communities in this category</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {communities.map((community, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getPlatformVariant(community.platform)}>
                    {getPlatformIcon(community.platform)}
                    {community.platform}
                  </Badge>
                  <Badge variant="outline">
                    {community.relevanceScore}% match
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-1">{community.name}</h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {community.description}
            </p>

            {/* Metrics */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{formatNumber(community.memberCount)} members</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>{community.activityScore}/100 activity</span>
              </div>
            </div>

            {/* Engagement Strategy */}
            {community.engagementStrategy && (
              <div className="bg-muted/50 rounded-lg p-4 mb-4 flex-1">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Engagement Strategy
                </p>
                <p className="text-sm">{community.engagementStrategy}</p>
              </div>
            )}

            {/* Best Posting Times */}
            {community.bestPostingTimes && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Clock className="h-3 w-3" />
                <span>{community.bestPostingTimes}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              <Button
                size="sm"
                className="gap-2 flex-1"
                onClick={() => window.open(community.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                View Community
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  toast({
                    title: "Community saved",
                    description: `${community.name} added to your tracking list`,
                  });
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Rules hint */}
            {community.rules && (
              <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">Rules: {community.rules}</span>
              </p>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function getPlatformVariant(platform: string): "default" | "secondary" | "destructive" | "outline" {
  switch (platform) {
    case "reddit":
      return "default";
    case "linkedin":
      return "secondary";
    case "slack":
    case "discord":
      return "outline";
    default:
      return "outline";
  }
}

function getPlatformIcon(platform: string) {
  // Using text icons for simplicity
  const icons: Record<string, string> = {
    reddit: "📱 ",
    linkedin: "💼 ",
    slack: "💬 ",
    discord: "🎮 ",
    facebook: "👥 ",
    forum: "💭 ",
  };
  return icons[platform] || "🌐 ";
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
