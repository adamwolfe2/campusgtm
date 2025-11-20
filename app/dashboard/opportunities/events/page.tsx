"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  Building2,
  Target,
  Filter,
  Save,
  ChevronDown,
  ChevronUp,
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
import {
  findRelevantEvents,
  quickSearchEvents,
  type EventResult,
  type EventFilters,
} from "@/app/actions/find-events";
import { toast } from "@/hooks/use-toast";
import { format, addMonths } from "date-fns";

export default function EventDiscoveryPage() {
  const [events, setEvents] = useState<EventResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

  // Filter state
  const [industry, setIndustry] = useState("");
  const [eventType, setEventType] = useState<string>("any");
  const [location, setLocation] = useState<string>("any");
  const [dateRange, setDateRange] = useState<string>("6months");
  const [audience, setAudience] = useState("");
  const [maxTicketPrice, setMaxTicketPrice] = useState("");

  // Quick search state
  const [quickSearch, setQuickSearch] = useState("");

  const handleAdvancedSearch = async () => {
    if (!industry) {
      toast({
        title: "Industry required",
        description: "Please specify an industry to search for events",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const now = new Date();
      const filters: EventFilters = {
        industry,
        eventType: eventType as any,
        location: location as any,
        audience,
        maxTicketPrice: maxTicketPrice ? parseFloat(maxTicketPrice) : undefined,
      };

      // Set date range based on selection
      if (dateRange !== "any") {
        const months = parseInt(dateRange.replace("months", ""));
        filters.dateRange = {
          start: now,
          end: addMonths(now, months),
        };
      }

      const results = await findRelevantEvents(filters);

      setEvents(results);

      toast({
        title: "Search complete",
        description: `Found ${results.length} relevant events`,
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
        description: "Please enter an industry or event type",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await quickSearchEvents(quickSearch);

      setEvents(results);

      toast({
        title: "Quick search complete",
        description: `Found ${results.length} events`,
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
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Event Discovery</h1>
        </div>
        <p className="text-muted-foreground">
          AI-powered search to find conferences, webinars, hackathons, and networking events
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Industry *
                </label>
                <Input
                  placeholder="e.g., SaaS, EdTech, MarTech"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Type
                </label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="summit">Summit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Location</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">Next 3 Months</SelectItem>
                    <SelectItem value="6months">Next 6 Months</SelectItem>
                    <SelectItem value="12months">Next 12 Months</SelectItem>
                    <SelectItem value="any">Any Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Target Audience
                </label>
                <Input
                  placeholder="e.g., founders, marketers"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Max Ticket Price ($)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 500"
                  value={maxTicketPrice}
                  onChange={(e) => setMaxTicketPrice(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleAdvancedSearch}
              disabled={isSearching}
              size="lg"
              className="w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isSearching ? "Searching for events..." : "Find Events"}
            </Button>
          </Card>
        </TabsContent>

        {/* Quick Search */}
        <TabsContent value="quick">
          <Card className="p-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter industry or event type (e.g., 'SaaS conferences' or 'marketing webinars')"
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
                "SaaS conferences",
                "EdTech summits",
                "startup hackathons",
                "marketing webinars",
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
      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {events.filter((e) => e.recommendedAction === "Attend").length}
                </p>
                <p className="text-sm text-muted-foreground">Recommended</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {events.filter((e) => e.sponsorshipAvailable).length}
                </p>
                <p className="text-sm text-muted-foreground">Sponsor Opps</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(
                    events.reduce((sum, e) => sum + e.relevanceScore, 0) / events.length
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Avg Relevance</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View Mode Toggle */}
      {events.length > 0 && (
        <div className="flex justify-end mb-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Results */}
      {events.length > 0 ? (
        viewMode === "grid" ? (
          <EventGrid events={events} />
        ) : (
          <EventTimeline events={events} />
        )
      ) : (
        !isSearching && (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No events found yet</h3>
            <p className="text-muted-foreground">
              Use the search above to discover relevant events for your industry
            </p>
          </Card>
        )
      )}
    </div>
  );
}

function EventGrid({ events }: { events: EventResult[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event, index) => (
        <EventCard key={index} event={event} index={index} />
      ))}
    </div>
  );
}

function EventTimeline({ events }: { events: EventResult[] }) {
  // Group events by month
  const eventsByMonth = events.reduce((acc, event) => {
    const month = event.date !== "TBD" ? event.date.substring(0, 7) : "TBD";
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {} as Record<string, EventResult[]>);

  const sortedMonths = Object.keys(eventsByMonth).sort();

  return (
    <div className="space-y-8">
      {sortedMonths.map((month) => (
        <div key={month}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {month !== "TBD" ? format(new Date(month + "-01"), "MMMM yyyy") : "Date TBD"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eventsByMonth[month].map((event, index) => (
              <EventCard key={index} event={event} index={index} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EventCard({ event, index }: { event: EventResult; index: number }) {
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
            <h3 className="text-lg font-semibold line-clamp-2 flex-1">{event.name}</h3>
            <Badge variant={getActionVariant(event.recommendedAction)}>
              {event.recommendedAction}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary">{event.eventType}</Badge>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {event.relevanceScore}% match
            </Badge>
            {event.sponsorshipAvailable && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-700">
                <Award className="h-3 w-3 mr-1" />
                Sponsorship
              </Badge>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{event.date !== "TBD" ? format(new Date(event.date), "MMM dd, yyyy") : "Date TBD"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{event.expectedAttendees} attendees</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className={getTicketPriceColor(event.ticketPrice)}>
                {event.ticketPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Key Topics */}
        {event.keyTopics.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {event.keyTopics.slice(0, 4).map((topic, i) => (
                <span
                  key={i}
                  className="text-xs bg-muted px-2 py-1 rounded-md"
                >
                  {topic}
                </span>
              ))}
              {event.keyTopics.length > 4 && (
                <span className="text-xs text-muted-foreground px-2 py-1">
                  +{event.keyTopics.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Why Attend */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4 flex-1">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Why Attend
          </p>
          <p className="text-sm">{event.whyAttend}</p>
        </div>

        {/* Expandable Sections */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 mb-4"
          >
            {/* Networking Opportunities */}
            <div className="bg-blue-500/5 rounded-lg p-4">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Networking Opportunities
              </p>
              <p className="text-sm">{event.networkingOpportunities}</p>
            </div>

            {/* Speakers */}
            {event.speakers.length > 0 && (
              <div className="bg-green-500/5 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Notable Speakers</p>
                <div className="flex flex-wrap gap-2">
                  {event.speakers.map((speaker, i) => (
                    <Badge key={i} variant="outline">
                      {speaker}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sponsorship Info */}
            {event.sponsorshipAvailable && (
              <div className="bg-purple-500/5 rounded-lg p-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Sponsorship Opportunity
                </p>
                <p className="text-sm">Estimated Cost: {event.estimatedSponsorshipCost}</p>
              </div>
            )}

            {/* CFP */}
            {event.cfpDeadline && (
              <div className="bg-orange-500/5 rounded-lg p-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Call for Speakers
                </p>
                <p className="text-sm">Deadline: {format(new Date(event.cfpDeadline), "MMM dd, yyyy")}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            className="gap-2 flex-1"
            onClick={() => window.open(event.website, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            Visit Website
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast({
                title: "Event saved",
                description: `${event.name} added to your calendar`,
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

function getActionVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  switch (action.toLowerCase()) {
    case "attend":
      return "default";
    case "sponsor":
      return "secondary";
    case "speak":
      return "outline";
    default:
      return "outline";
  }
}

function getTicketPriceColor(price: string): string {
  if (price.toLowerCase().includes("free")) {
    return "text-green-600 font-medium";
  }
  return "";
}
