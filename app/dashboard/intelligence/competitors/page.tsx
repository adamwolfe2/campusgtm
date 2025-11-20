"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Search,
  Eye,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  findCompetitors,
  snapshotCompetitor,
  detectChanges,
} from "@/app/actions/track-competitors";
import { toast } from "@/hooks/use-toast";

interface Competitor {
  name: string;
  website: string;
  description: string;
  source: string;
  lastSnapshot?: Date;
  snapshot?: {
    url: string;
    contentHash: string;
    metadata: {
      pricing?: string[];
      features?: string[];
      teamSize?: string;
      latestUpdates?: string[];
      lastModified?: string;
    };
  };
}

interface Change {
  competitorName: string;
  changeType: "pricing" | "feature" | "content" | "design" | "other";
  summary: string;
  oldContent: string;
  newContent: string;
  impactScore: number;
  detectedAt: Date;
}

export default function CompetitorsPage() {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [snapshotting, setSnapshotting] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!companyName.trim() || !industry.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both company name and industry",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await findCompetitors(companyName, industry);
      setCompetitors(results.map(r => ({ ...r, lastSnapshot: undefined, snapshot: undefined })));

      toast({
        title: "Search complete",
        description: `Found ${results.length} competitors for ${companyName}`,
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

  const handleSnapshot = async (competitor: Competitor) => {
    setSnapshotting(competitor.website);
    try {
      const snapshot = await snapshotCompetitor(competitor.website);

      // Update competitor with snapshot data
      setCompetitors(prev =>
        prev.map(c =>
          c.website === competitor.website
            ? { ...c, lastSnapshot: new Date(), snapshot }
            : c
        )
      );

      // If there's a previous snapshot, detect changes
      if (competitor.snapshot) {
        const detectedChanges = await detectChanges(
          competitor.name,
          {
            content: competitor.snapshot.url,
            metadata: competitor.snapshot.metadata,
          },
          {
            content: snapshot.url,
            metadata: snapshot.metadata,
          }
        );

        if (detectedChanges.length > 0) {
          setChanges(prev => [
            ...prev,
            ...detectedChanges.map(change => ({
              ...change,
              competitorName: competitor.name,
              detectedAt: new Date(),
            })),
          ]);

          toast({
            title: "Changes detected!",
            description: `Found ${detectedChanges.length} significant changes`,
          });
        } else {
          toast({
            title: "Snapshot complete",
            description: "No significant changes detected",
          });
        }
      } else {
        toast({
          title: "Snapshot complete",
          description: "Baseline snapshot created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Snapshot failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSnapshotting(null);
    }
  };

  const criticalChanges = changes.filter(c => c.impactScore >= 80);
  const importantChanges = changes.filter(c => c.impactScore >= 60 && c.impactScore < 80);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Competitor Tracker</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor your competitors' pricing, features, and product updates
        </p>
      </motion.div>

      {/* Search Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Find Competitors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Company Name
            </label>
            <Input
              placeholder="e.g., Campus GTM"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="text-base"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Industry</label>
            <Input
              placeholder="e.g., B2B SaaS, EdTech, Marketing Automation"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="text-base"
            />
          </div>
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          size="lg"
          className="w-full md:w-auto gap-2"
        >
          <Search className="h-4 w-4" />
          {isSearching ? "Searching..." : "Find Competitors"}
        </Button>

        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Examples:</span>
          {[
            { company: "Notion", industry: "Productivity SaaS" },
            { company: "Stripe", industry: "Payment Processing" },
            { company: "Figma", industry: "Design Tools" },
          ].map((example) => (
            <Button
              key={example.company}
              variant="outline"
              size="sm"
              onClick={() => {
                setCompanyName(example.company);
                setIndustry(example.industry);
                setTimeout(handleSearch, 100);
              }}
            >
              {example.company}
            </Button>
          ))}
        </div>
      </Card>

      {/* Stats Cards */}
      {(competitors.length > 0 || changes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{competitors.length}</p>
                <p className="text-sm text-muted-foreground">Competitors Tracked</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalChanges.length}</p>
                <p className="text-sm text-muted-foreground">Critical Changes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{changes.length}</p>
                <p className="text-sm text-muted-foreground">Total Changes</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs: Competitors vs Changes */}
      {competitors.length > 0 ? (
        <Tabs defaultValue="competitors" className="w-full">
          <TabsList>
            <TabsTrigger value="competitors">
              Competitors ({competitors.length})
            </TabsTrigger>
            <TabsTrigger value="changes">
              Changes ({changes.length})
            </TabsTrigger>
          </TabsList>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitors.map((competitor, index) => (
                <motion.div
                  key={competitor.website}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-5 hover:shadow-lg transition-shadow h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {competitor.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {competitor.source}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                      {competitor.description}
                    </p>

                    {/* Snapshot Info */}
                    {competitor.snapshot && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-4 space-y-2">
                        {competitor.snapshot.metadata.pricing && (
                          <div className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-xs">
                              <div className="font-medium mb-1">Pricing:</div>
                              {competitor.snapshot.metadata.pricing.slice(0, 2).map((price, i) => (
                                <div key={i} className="text-muted-foreground">{price}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {competitor.snapshot.metadata.teamSize && (
                          <div className="flex items-center gap-2 text-xs">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {competitor.snapshot.metadata.teamSize}
                            </span>
                          </div>
                        )}
                        {competitor.lastSnapshot && (
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Snapshot: {new Date(competitor.lastSnapshot).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => window.open(competitor.website, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Visit
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleSnapshot(competitor)}
                        disabled={snapshotting === competitor.website}
                      >
                        <Eye className="h-4 w-4" />
                        {snapshotting === competitor.website
                          ? "Snapshotting..."
                          : competitor.snapshot
                          ? "Update"
                          : "Snapshot"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Changes Tab */}
          <TabsContent value="changes" className="mt-6">
            {changes.length === 0 ? (
              <Card className="p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No changes yet</h3>
                <p className="text-muted-foreground">
                  Take snapshots of competitors to start tracking changes
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Critical Changes */}
                {criticalChanges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Critical Changes
                    </h3>
                    <div className="space-y-3">
                      {criticalChanges.map((change, index) => (
                        <ChangeCard key={index} change={change} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Important Changes */}
                {importantChanges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 mt-6">
                      <TrendingUp className="h-5 w-5 text-yellow-500" />
                      Important Changes
                    </h3>
                    <div className="space-y-3">
                      {importantChanges.map((change, index) => (
                        <ChangeCard key={index} change={change} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Other Changes */}
                {changes.filter(c => c.impactScore < 60).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 mt-6">
                      <TrendingDown className="h-5 w-5 text-muted-foreground" />
                      Other Changes
                    </h3>
                    <div className="space-y-3">
                      {changes
                        .filter(c => c.impactScore < 60)
                        .map((change, index) => (
                          <ChangeCard key={index} change={change} />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        !isSearching && (
          <Card className="p-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No competitors yet</h3>
            <p className="text-muted-foreground">
              Enter your company name and industry above to find competitors
            </p>
          </Card>
        )
      )}
    </div>
  );
}

function ChangeCard({ change }: { change: Change }) {
  const typeColors = {
    pricing: "bg-red-500/10 text-red-500 border-red-500/20",
    feature: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    content: "bg-green-500/10 text-green-500 border-green-500/20",
    design: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  const typeIcons = {
    pricing: DollarSign,
    feature: Sparkles,
    content: TrendingUp,
    design: Eye,
    other: AlertCircle,
  };

  const Icon = typeIcons[change.changeType];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={typeColors[change.changeType]}>
                <Icon className="h-3 w-3 mr-1" />
                {change.changeType}
              </Badge>
              <Badge variant="outline">{change.competitorName}</Badge>
              <Badge
                variant={change.impactScore >= 80 ? "destructive" : "secondary"}
              >
                Impact: {change.impactScore}
              </Badge>
            </div>
            <h4 className="font-semibold mb-2">{change.summary}</h4>
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-medium mb-1 text-muted-foreground">
              Before:
            </p>
            <p className="text-sm">{change.oldContent}</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-xs font-medium mb-1 text-primary">After:</p>
            <p className="text-sm">{change.newContent}</p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            Detected {new Date(change.detectedAt).toLocaleDateString()} at{" "}
            {new Date(change.detectedAt).toLocaleTimeString()}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
