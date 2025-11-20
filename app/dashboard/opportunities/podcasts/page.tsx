"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  ExternalLink,
  Mail,
  Twitter,
  Linkedin,
  TrendingUp,
  Users,
  Clock,
  Radio,
  Sparkles,
  Filter,
  Save,
  ChevronDown,
  ChevronUp,
  Target,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  findRelevantPodcasts,
  quickSearchPodcasts,
  type PodcastResult,
  type PodcastFilters,
} from "@/app/actions/find-podcasts";
import { toast } from "@/hooks/use-toast";

export default function PodcastFinderPage() {
  const [podcasts, setPodcasts] = useState<PodcastResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter state
  const [niche, setNiche] = useState("");
  const [audienceSize, setAudienceSize] = useState<string>("any");
  const [guestFormat, setGuestFormat] = useState(true);
  const [releaseFrequency, setReleaseFrequency] = useState<string>("any");

  // Quick search state
  const [quickSearch, setQuickSearch] = useState("");

  const handleAdvancedSearch = async () => {
    if (!niche) {
      toast({
        title: "Niche required",
        description: "Please specify a niche or industry",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const filters: PodcastFilters = {
        niche,
        audienceSize: audienceSize as any,
        guestFormat,
        releaseFrequency: releaseFrequency as any,
      };

      const results = await findRelevantPodcasts(filters);

      setPodcasts(results);

      toast({
        title: "Search complete",
        description: `Found ${results.length} relevant podcasts`,
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
        description: "Please enter a niche or industry",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await quickSearchPodcasts(quickSearch);

      setPodcasts(results);

      toast({
        title: "Quick search complete",
        description: `Found ${results.length} podcasts`,
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
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Podcast Outreach Finder</h1>
        </div>
        <p className="text-muted-foreground">
          Discover podcasts where you can share your story and expertise
        </p>
      </motion.div>

      {/* Search Tabs */}
      <Tabs defaultValue="advanced" className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="advanced">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Search
          </TabsTrigger>
          <TabsTrigger value="quick">
            <Sparkles className="h-4 w-4 mr-2" />
            Quick Search
          </TabsTrigger>
        </TabsList>

        {/* Advanced Search */}
        <TabsContent value="advanced">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Niche / Industry *
                </label>
                <Input
                  placeholder="e.g., 'SaaS growth', 'startup marketing', 'college entrepreneurship'"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific about your area of expertise
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Audience Size
                </label>
                <Select value={audienceSize} onValueChange={setAudienceSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Size</SelectItem>
                    <SelectItem value="small">Small (&lt;10K)</SelectItem>
                    <SelectItem value="medium">Medium (10-50K)</SelectItem>
                    <SelectItem value="large">Large (&gt;50K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Release Frequency
                </label>
                <Select value={releaseFrequency} onValueChange={setReleaseFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Frequency</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Radio className="h-4 w-4" />
                      Guest Interview Format Only
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Only show podcasts that regularly interview guests
                    </p>
                  </div>
                  <Switch checked={guestFormat} onCheckedChange={setGuestFormat} />
                </div>
              </div>
            </div>

            <Button
              onClick={handleAdvancedSearch}
              disabled={isSearching}
              size="lg"
              className="w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isSearching ? "Searching for podcasts..." : "Find Podcasts"}
            </Button>
          </Card>
        </TabsContent>

        {/* Quick Search */}
        <TabsContent value="quick">
          <Card className="p-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter niche or industry (e.g., 'SaaS growth' or 'startup marketing')"
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
                <Sparkles className="h-4 w-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Quick searches:</span>
              {[
                "SaaS founders",
                "startup marketing",
                "growth hacking",
                "student entrepreneurship",
              ].map((q) => (
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
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Stats */}
      {podcasts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{podcasts.length}</p>
                <p className="text-sm text-muted-foreground">Total Found</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {podcasts.filter((p) => p.fitScore >= 80).length}
                </p>
                <p className="text-sm text-muted-foreground">Great Fit</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {podcasts.filter((p) => p.guestFormat).length}
                </p>
                <p className="text-sm text-muted-foreground">Guest Format</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {podcasts.filter((p) => p.contactInfo.email).length}
                </p>
                <p className="text-sm text-muted-foreground">With Contact</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Results */}
      {podcasts.length > 0 ? (
        <PodcastGrid podcasts={podcasts} />
      ) : (
        !isSearching && (
          <Card className="p-12 text-center">
            <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No podcasts found yet</h3>
            <p className="text-muted-foreground">
              Use the search above to discover podcasts in your niche
            </p>
          </Card>
        )
      )}
    </div>
  );
}

function PodcastGrid({ podcasts }: { podcasts: PodcastResult[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {podcasts.map((podcast, index) => (
        <PodcastCard key={index} podcast={podcast} index={index} />
      ))}
    </div>
  );
}

function PodcastCard({ podcast, index }: { podcast: PodcastResult; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{podcast.name}</h3>
              <p className="text-sm text-muted-foreground">Hosted by {podcast.host}</p>
            </div>
            <Badge variant={getFitScoreVariant(podcast.fitScore)} className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {podcast.fitScore}% fit
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {podcast.guestFormat && (
              <Badge variant="default" className="gap-1">
                <Radio className="h-3 w-3" />
                Guest Format
              </Badge>
            )}
            {podcast.platforms.map((platform) => (
              <Badge key={platform} variant="outline">
                {platform}
              </Badge>
            ))}
          </div>

          {/* Podcast Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{podcast.estimatedListeners}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{podcast.releaseFrequency} • {podcast.averageLength}</span>
            </div>
            {podcast.episodeCount > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mic className="h-4 w-4" />
                <span>{podcast.episodeCount} episodes</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {podcast.description}
        </p>

        {/* Audience */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm">
          <p className="font-medium mb-1">Audience</p>
          <p className="text-muted-foreground">{podcast.audienceDescription}</p>
        </div>

        {/* Typical Guest Profile */}
        <div className="bg-blue-500/5 rounded-lg p-3 mb-4 text-sm">
          <p className="font-medium mb-1">Typical Guests</p>
          <p className="text-muted-foreground">{podcast.typicalGuestProfile}</p>
        </div>

        {/* Recent Topics */}
        {podcast.recentTopics.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Recent Topics</p>
            <div className="flex flex-wrap gap-1">
              {podcast.recentTopics.slice(0, 5).map((topic, i) => (
                <span
                  key={i}
                  className="text-xs bg-muted px-2 py-1 rounded-md"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Why You Fit */}
        <div className="bg-green-500/5 rounded-lg p-4 mb-4 flex-1">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Why You Fit
          </p>
          <p className="text-sm">{podcast.whyYouFit}</p>
        </div>

        {/* Expandable Sections */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 mb-4"
          >
            {/* Pitch Strategy */}
            <div className="bg-purple-500/5 rounded-lg p-4">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Pitch Strategy
              </p>
              <p className="text-sm">{podcast.pitchStrategy}</p>
            </div>

            {/* Contact Info */}
            <div className="bg-orange-500/5 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">Contact Information</p>
              <div className="space-y-2">
                {podcast.contactInfo.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${podcast.contactInfo.email}`}
                      className="text-primary hover:underline"
                    >
                      {podcast.contactInfo.email}
                    </a>
                  </div>
                )}
                {podcast.contactInfo.twitterHandle && (
                  <div className="flex items-center gap-2 text-sm">
                    <Twitter className="h-4 w-4" />
                    <a
                      href={`https://twitter.com/${podcast.contactInfo.twitterHandle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {podcast.contactInfo.twitterHandle}
                    </a>
                  </div>
                )}
                {podcast.contactInfo.linkedinUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="h-4 w-4" />
                    <a
                      href={podcast.contactInfo.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {podcast.contactInfo.guestApplicationUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4" />
                    <a
                      href={podcast.contactInfo.guestApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Guest Application Form
                    </a>
                  </div>
                )}
                {!podcast.contactInfo.email &&
                  !podcast.contactInfo.twitterHandle &&
                  !podcast.contactInfo.linkedinUrl &&
                  !podcast.contactInfo.guestApplicationUrl && (
                    <p className="text-sm text-muted-foreground">
                      Visit website to find contact information
                    </p>
                  )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            className="gap-2 flex-1"
            onClick={() => window.open(podcast.website, "_blank")}
            disabled={podcast.website === "#"}
          >
            <ExternalLink className="h-4 w-4" />
            Visit Podcast
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast({
                title: "Podcast saved",
                description: `${podcast.name} added to your outreach list`,
              });
            }}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function getFitScoreVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "outline";
}
