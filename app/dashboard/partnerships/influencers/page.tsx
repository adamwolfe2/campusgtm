"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  TrendingUp,
  DollarSign,
  Target,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Star,
  ExternalLink,
  Bookmark,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  findMicroInfluencers,
  type InfluencerFilters,
  type InfluencerResult,
} from "@/app/actions/find-influencers";

export default function InfluencerFinderPage() {
  const [filters, setFilters] = React.useState<InfluencerFilters>({
    niche: "",
    platform: "all",
    minFollowers: 1000,
    maxFollowers: 100000,
    engagementRate: 2,
    location: "",
  });

  const [influencers, setInfluencers] = React.useState<InfluencerResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"brandFit" | "followers" | "engagement">("brandFit");
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!filters.niche.trim()) {
      toast.error("Please enter a niche");
      return;
    }

    setIsSearching(true);
    setInfluencers([]);

    try {
      const results = await findMicroInfluencers(filters);
      setInfluencers(results);

      if (results.length === 0) {
        toast.info("No influencers found. Try adjusting your filters.");
      } else {
        toast.success(`Found ${results.length} influencers`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to find influencers. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleExpanded = (handle: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) {
        next.delete(handle);
      } else {
        next.add(handle);
      }
      return next;
    });
  };

  const getBrandFitColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getBrandFitLabel = (score: number) => {
    if (score >= 80) return "Excellent Fit";
    if (score >= 60) return "Good Fit";
    return "Fair Fit";
  };

  const sortedInfluencers = React.useMemo(() => {
    const sorted = [...influencers];

    switch (sortBy) {
      case "followers":
        sorted.sort((a, b) => b.followerCount - a.followerCount);
        break;
      case "engagement":
        sorted.sort((a, b) => b.estimatedEngagementRate - a.estimatedEngagementRate);
        break;
      case "brandFit":
      default:
        sorted.sort((a, b) => b.brandFitScore - a.brandFitScore);
        break;
    }

    return sorted;
  }, [influencers, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
            <h1 className="text-3xl font-bold">Influencer Finder</h1>
          </div>
          <p className="text-muted-foreground">
            Discover micro-influencers (1K-100K followers) who align with your brand
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Criteria
              </CardTitle>
              <CardDescription>
                Define your ideal influencer profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Niche Input */}
                <div>
                  <Label htmlFor="niche">
                    Niche / Industry *
                  </Label>
                  <Input
                    id="niche"
                    placeholder="e.g., SaaS marketing, college tech, fitness"
                    value={filters.niche}
                    onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be specific: "B2B SaaS growth marketing" works better than "marketing"
                  </p>
                </div>

                {/* Platform & Location Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={filters.platform}
                      onValueChange={(value) =>
                        setFilters({ ...filters, platform: value as any })
                      }
                    >
                      <SelectTrigger id="platform" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      placeholder="e.g., United States, Europe"
                      value={filters.location || ""}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Follower Range */}
                <div>
                  <Label>
                    Follower Range: {filters.minFollowers.toLocaleString()} - {filters.maxFollowers.toLocaleString()}
                  </Label>
                  <div className="space-y-4 mt-4">
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Min: {filters.minFollowers.toLocaleString()}</span>
                      </div>
                      <Slider
                        value={[filters.minFollowers]}
                        onValueChange={([value]) =>
                          setFilters({ ...filters, minFollowers: value })
                        }
                        min={500}
                        max={50000}
                        step={500}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Max: {filters.maxFollowers.toLocaleString()}</span>
                      </div>
                      <Slider
                        value={[filters.maxFollowers]}
                        onValueChange={([value]) =>
                          setFilters({ ...filters, maxFollowers: value })
                        }
                        min={10000}
                        max={200000}
                        step={5000}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Engagement Rate */}
                <div>
                  <Label htmlFor="engagement">
                    Minimum Engagement Rate: {filters.engagementRate}%
                  </Label>
                  <Slider
                    id="engagement"
                    value={[filters.engagementRate || 2]}
                    onValueChange={([value]) =>
                      setFilters({ ...filters, engagementRate: value })
                    }
                    min={1}
                    max={10}
                    step={0.5}
                    className="mt-4"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    2-5% is typical for micro-influencers
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Search className="h-4 w-4" />
                      </motion.div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Find Influencers
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        {influencers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {influencers.length} influencers found
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="text-sm">Sort by:</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger id="sort" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brandFit">Brand Fit</SelectItem>
                    <SelectItem value="followers">Follower Count</SelectItem>
                    <SelectItem value="engagement">Engagement Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Influencer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedInfluencers.map((influencer, index) => {
                const isExpanded = expandedCards.has(influencer.handle);

                return (
                  <motion.div
                    key={influencer.handle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              <span>{influencer.name}</span>
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {influencer.platform}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {influencer.handle}
                            </CardDescription>
                          </div>

                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getBrandFitColor(influencer.brandFitScore)} text-white text-xs font-semibold`}>
                            <Star className="h-3 w-3" />
                            {influencer.brandFitScore}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Followers</p>
                              <p className="text-sm font-semibold">
                                {influencer.followerCount.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Engagement</p>
                              <p className="text-sm font-semibold">
                                {influencer.estimatedEngagementRate.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Topics */}
                        {influencer.recentTopics.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Recent Topics
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {influencer.recentTopics.slice(0, 3).map((topic) => (
                                <Badge key={topic} variant="secondary" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Audience */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            Audience
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {influencer.audienceDemographics}
                          </p>
                        </div>

                        {/* Cost */}
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {influencer.estimatedCost}
                          </p>
                        </div>

                        {/* Outreach Strategy (Expandable) */}
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(influencer.handle)}
                            className="w-full justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Outreach Strategy
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
                              className="mt-3 p-3 rounded-lg bg-muted text-sm"
                            >
                              {influencer.outreachStrategy}
                            </motion.div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              window.open(influencer.profileUrl, "_blank");
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast.success("Influencer saved!");
                            }}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isSearching && influencers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Find Your Perfect Influencers
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter your niche and filters above to discover micro-influencers who align with your brand
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
