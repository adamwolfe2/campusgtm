"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Building2,
  Target,
  TrendingUp,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bookmark,
  Filter,
  Users,
  Zap,
  Linkedin,
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
import { toast } from "sonner";
import {
  findPartnershipOpportunities,
  type PartnershipFilters,
  type PartnershipResult,
} from "@/app/actions/find-partnerships";

export default function PartnershipFinderPage() {
  const [filters, setFilters] = React.useState<PartnershipFilters>({
    industry: "",
    companyStage: "startup",
    partnershipType: "all",
    targetAudience: "",
    excludeCompetitors: true,
  });

  const [partnerships, setPartnerships] = React.useState<PartnershipResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"mutualBenefit" | "alphabetical">("mutualBenefit");
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!filters.industry.trim() || !filters.targetAudience.trim()) {
      toast.error("Please fill in industry and target audience");
      return;
    }

    setIsSearching(true);
    setPartnerships([]);

    try {
      const results = await findPartnershipOpportunities(filters);
      setPartnerships(results);

      if (results.length === 0) {
        toast.info("No partnerships found. Try adjusting your filters.");
      } else {
        toast.success(`Found ${results.length} potential partners`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to find partnerships. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleExpanded = (website: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(website)) {
        next.delete(website);
      } else {
        next.add(website);
      }
      return next;
    });
  };

  const getBenefitColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getBenefitLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    return "Fair Match";
  };

  const getPartnershipIcon = (type: string) => {
    switch (type) {
      case "co-marketing":
        return <TrendingUp className="h-3 w-3" />;
      case "integration":
        return <Zap className="h-3 w-3" />;
      case "content":
        return <Target className="h-3 w-3" />;
      case "referral":
        return <Users className="h-3 w-3" />;
      default:
        return <Building2 className="h-3 w-3" />;
    }
  };

  const sortedPartnerships = React.useMemo(() => {
    const sorted = [...partnerships];

    switch (sortBy) {
      case "alphabetical":
        sorted.sort((a, b) => a.companyName.localeCompare(b.companyName));
        break;
      case "mutualBenefit":
      default:
        sorted.sort((a, b) => b.mutualBenefitScore - a.mutualBenefitScore);
        break;
    }

    return sorted;
  }, [partnerships, sortBy]);

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
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Partnership Finder</h1>
          </div>
          <p className="text-muted-foreground">
            Discover companies for co-marketing, integrations, and strategic partnerships
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
                Partnership Criteria
              </CardTitle>
              <CardDescription>
                Define your ideal partnership profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Industry & Target Audience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">
                      Industry *
                    </Label>
                    <Input
                      id="industry"
                      placeholder="e.g., SaaS, fintech, education"
                      value={filters.industry}
                      onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">
                      Target Audience *
                    </Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., B2B marketers, startup founders"
                      value={filters.targetAudience}
                      onChange={(e) => setFilters({ ...filters, targetAudience: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Company Stage & Partnership Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyStage">Company Stage</Label>
                    <Select
                      value={filters.companyStage}
                      onValueChange={(value: any) =>
                        setFilters({ ...filters, companyStage: value })
                      }
                    >
                      <SelectTrigger id="companyStage" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (Seed - Series A)</SelectItem>
                        <SelectItem value="scaleup">Scaleup (Series B+)</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="partnershipType">Partnership Type</Label>
                    <Select
                      value={filters.partnershipType}
                      onValueChange={(value: any) =>
                        setFilters({ ...filters, partnershipType: value })
                      }
                    >
                      <SelectTrigger id="partnershipType" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="co-marketing">Co-Marketing</SelectItem>
                        <SelectItem value="integration">Product Integration</SelectItem>
                        <SelectItem value="referral">Referral Program</SelectItem>
                        <SelectItem value="content">Content Collaboration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Exclude Competitors Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="excludeCompetitors"
                    checked={filters.excludeCompetitors}
                    onChange={(e) =>
                      setFilters({ ...filters, excludeCompetitors: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="excludeCompetitors" className="font-normal cursor-pointer">
                    Exclude direct competitors
                  </Label>
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
                      Find Partners
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        {partnerships.length > 0 && (
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
                  {partnerships.length} potential partners found
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="text-sm">Sort by:</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger id="sort" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mutualBenefit">Mutual Benefit</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Partnership Cards */}
            <div className="space-y-6">
              {sortedPartnerships.map((partner, index) => {
                const isExpanded = expandedCards.has(partner.website);

                return (
                  <motion.div
                    key={partner.website}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle>{partner.companyName}</CardTitle>
                              <div
                                className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-semibold ${getBenefitColor(partner.mutualBenefitScore)}`}
                              >
                                {partner.mutualBenefitScore}
                              </div>
                            </div>

                            <CardDescription className="text-base">
                              {partner.description}
                            </CardDescription>

                            {/* Partnership Types */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {partner.partnershipType.map((type) => (
                                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                                  {getPartnershipIcon(type)}
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Shared Audience */}
                        <div className="p-4 rounded-lg bg-muted">
                          <div className="flex items-start gap-3">
                            <Target className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold mb-1">
                                Shared Audience
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {partner.sharedAudience}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Why Partner */}
                        <div>
                          <p className="text-sm font-semibold mb-2">
                            Why Partner?
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {partner.complementaryProducts}
                          </p>
                        </div>

                        {/* Company Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Industry
                            </p>
                            <p className="text-sm font-medium">
                              {partner.industry}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Company Size
                            </p>
                            <p className="text-sm font-medium">
                              {partner.estimatedSize}
                            </p>
                          </div>
                        </div>

                        {/* Outreach Strategy (Expandable) */}
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(partner.website)}
                            className="w-full justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
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
                              className="mt-3 p-4 rounded-lg bg-muted text-sm space-y-3"
                            >
                              <p>{partner.outreachStrategy}</p>

                              {/* Contact Info */}
                              {(partner.contactInfo.linkedinUrl || partner.contactInfo.email || partner.contactInfo.foundersName) && (
                                <div className="pt-3 border-t border-border">
                                  <p className="text-xs font-semibold mb-2">Contact Info</p>
                                  <div className="space-y-1">
                                    {partner.contactInfo.foundersName && (
                                      <p className="text-xs">
                                        <span className="text-muted-foreground">Founder:</span>{" "}
                                        {partner.contactInfo.foundersName}
                                      </p>
                                    )}
                                    {partner.contactInfo.email && (
                                      <p className="text-xs">
                                        <span className="text-muted-foreground">Email:</span>{" "}
                                        {partner.contactInfo.email}
                                      </p>
                                    )}
                                    {partner.contactInfo.linkedinUrl && (
                                      <a
                                        href={partner.contactInfo.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                      >
                                        <Linkedin className="h-3 w-3" />
                                        LinkedIn Profile
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
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
                              window.open(partner.website, "_blank");
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Website
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast.success("Partner saved!");
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
        {!isSearching && partnerships.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Find Strategic Partners
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter your industry and target audience to discover companies for co-marketing,
              integrations, and strategic partnerships
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
