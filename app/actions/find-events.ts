"use server";

import { searchWeb } from "@/lib/scraper/jina-reader";
import { searchReddit } from "@/lib/scraper/reddit-api";
import { generateText } from "ai";
import { getAIModel } from "@/lib/ai/provider-factory";
import { format, parse, isAfter, isBefore } from "date-fns";

export interface EventFilters {
  industry: string;
  eventType: "conference" | "webinar" | "hackathon" | "meetup" | "summit" | "any";
  location: "virtual" | "in-person" | "hybrid" | "any";
  dateRange?: {
    start: Date;
    end: Date;
  };
  audience?: string;
  maxTicketPrice?: number;
}

export interface EventResult {
  name: string;
  eventType: string;
  date: string;
  location: string;
  website: string;
  description: string;
  expectedAttendees: string;
  keyTopics: string[];
  speakers: string[];
  ticketPrice: string;
  sponsorshipAvailable: boolean;
  estimatedSponsorshipCost: string;
  cfpDeadline?: string;
  relevanceScore: number;
  whyAttend: string;
  networkingOpportunities: string;
  recommendedAction: string;
}

/**
 * Main event discovery function
 * Searches across web, Reddit, and event platforms for relevant events
 */
export async function findRelevantEvents(
  filters: EventFilters
): Promise<EventResult[]> {
  const events: EventResult[] = [];

  try {
    // Step 1: Generate search queries for events
    const searchQueries = await generateEventSearchQueries(filters);

    // Step 2: Search web for events (parallel)
    const [webEvents, redditEvents] = await Promise.allSettled([
      searchWebForEvents(searchQueries, filters),
      searchRedditForEvents(searchQueries, filters),
    ]);

    // Combine results
    if (webEvents.status === "fulfilled") {
      events.push(...webEvents.value);
    } else {
      console.error("Web event search failed:", webEvents.reason);
    }

    if (redditEvents.status === "fulfilled") {
      events.push(...redditEvents.value);
    } else {
      console.error("Reddit event search failed:", redditEvents.reason);
    }

    // Step 3: Deduplicate by URL
    const uniqueEvents = Array.from(
      new Map(events.map((e) => [e.website, e])).values()
    );

    // Step 4: Filter by date range if specified
    const filteredEvents = filters.dateRange
      ? uniqueEvents.filter((event) => {
          try {
            const eventDate = parse(event.date, "yyyy-MM-dd", new Date());
            return (
              isAfter(eventDate, filters.dateRange!.start) &&
              isBefore(eventDate, filters.dateRange!.end)
            );
          } catch {
            return true; // Keep if date parsing fails
          }
        })
      : uniqueEvents;

    // Step 5: Sort by relevance score
    filteredEvents.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return filteredEvents.slice(0, 30); // Top 30 events
  } catch (error) {
    console.error("Event discovery error:", error);
    throw new Error(
      `Failed to find events: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate smart search queries for events
 */
async function generateEventSearchQueries(
  filters: EventFilters
): Promise<string[]> {
  try {
    const model = await getAIModel();

    const prompt = `Generate 5-7 search queries to find ${filters.eventType !== "any" ? filters.eventType + "s" : "events"} in the ${filters.industry} industry.

Event Criteria:
- Industry: ${filters.industry}
- Event Type: ${filters.eventType}
- Location: ${filters.location}
- Target Audience: ${filters.audience || "professionals"}

Generate specific search queries that would find:
1. Industry conferences and summits
2. Virtual events and webinars
3. Hackathons and competitions
4. Networking meetups
5. Trade shows and exhibitions

Focus on events happening in 2025 and upcoming events.

Examples:
- "${filters.industry} conferences 2025"
- "${filters.industry} virtual summit"
- "${filters.industry} hackathon ${filters.location !== "virtual" ? "in-person" : ""}"
- "${filters.audience || filters.industry} networking events"

Respond with just the queries, one per line.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    const queries = result.text
      .split("\n")
      .map((q) => q.trim().replace(/^[-•*]\s*/, "").replace(/^["']|["']$/g, ""))
      .filter((q) => q && q.length > 5)
      .slice(0, 7);

    return queries;
  } catch (error) {
    console.error("Query generation error:", error);
    // Fallback queries
    return [
      `${filters.industry} conferences 2025`,
      `${filters.industry} ${filters.eventType} events`,
      `${filters.industry} virtual summit`,
      `${filters.audience || filters.industry} networking events`,
    ];
  }
}

/**
 * Search web for events using Jina
 */
async function searchWebForEvents(
  queries: string[],
  filters: EventFilters
): Promise<EventResult[]> {
  const events: EventResult[] = [];

  for (const query of queries) {
    try {
      const searchResult = await searchWeb(query);

      // Extract events from search results using AI
      const extractedEvents = await extractEventsFromSearchResults(
        searchResult.content,
        filters
      );

      events.push(...extractedEvents);
    } catch (error) {
      console.error(`Web search error for "${query}":`, error);
    }
  }

  return events;
}

/**
 * Search Reddit for event announcements
 */
async function searchRedditForEvents(
  queries: string[],
  filters: EventFilters
): Promise<EventResult[]> {
  const events: EventResult[] = [];

  for (const query of queries) {
    try {
      const searchResults = await searchReddit(query, {
        sort: "relevance",
        time: "month",
        limit: 10,
      });

      for (const post of searchResults.posts) {
        // Check if post mentions event-related keywords
        const text = `${post.title} ${post.selftext}`.toLowerCase();
        const hasEventKeywords =
          text.includes("conference") ||
          text.includes("summit") ||
          text.includes("hackathon") ||
          text.includes("meetup") ||
          text.includes("webinar") ||
          text.includes("event");

        if (!hasEventKeywords) continue;

        // Extract event details from post
        const eventDetails = await extractEventFromRedditPost(post, filters);
        if (eventDetails) {
          events.push(eventDetails);
        }
      }
    } catch (error) {
      console.error(`Reddit search error for "${query}":`, error);
    }
  }

  return events;
}

/**
 * Extract events from web search results using AI
 */
async function extractEventsFromSearchResults(
  searchText: string,
  filters: EventFilters
): Promise<EventResult[]> {
  try {
    const model = await getAIModel();

    const prompt = `Extract upcoming events from this search result text:

${searchText.substring(0, 10000)}

Filters:
- Industry: ${filters.industry}
- Event Type: ${filters.eventType}
- Location Preference: ${filters.location}

Extract events with the following information:
1. Event name
2. Event type (conference, webinar, hackathon, meetup, summit)
3. Date (YYYY-MM-DD format, estimate if exact date not available)
4. Location (city, state/country or "Virtual")
5. Website/registration URL
6. Brief description (2-3 sentences)
7. Expected attendees (estimate: "100-500", "1000-5000", etc.)
8. Key topics covered (array of strings)
9. Notable speakers if mentioned (array of names)
10. Ticket price ("Free", "$299", "$500-1500", "Unknown")
11. Sponsorship opportunities available (boolean)
12. Estimated sponsorship cost if mentioned ("$5K-15K", "Unknown")
13. CFP deadline if accepting speakers (YYYY-MM-DD or null)

Only include legitimate, upcoming events (2025 and beyond). Focus on professional/industry events.

Respond in JSON array format:
[
  {
    "name": "TechCrunch Disrupt 2025",
    "eventType": "conference",
    "date": "2025-09-15",
    "location": "San Francisco, CA",
    "website": "https://techcrunch.com/events/disrupt-2025",
    "description": "The premier startup conference...",
    "expectedAttendees": "10000-15000",
    "keyTopics": ["AI", "Startups", "Venture Capital"],
    "speakers": ["John Doe", "Jane Smith"],
    "ticketPrice": "$1495-2995",
    "sponsorshipAvailable": true,
    "estimatedSponsorshipCost": "$50K-250K",
    "cfpDeadline": "2025-06-01"
  }
]

If no events found, return empty array [].`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return await Promise.all(
        parsed.map(async (e: any) => {
          // Score relevance and generate insights
          const insights = await generateEventInsights(e, filters);

          return {
            name: e.name,
            eventType: e.eventType || "conference",
            date: e.date || "TBD",
            location: e.location || "Location TBD",
            website: e.website || "#",
            description: e.description || "",
            expectedAttendees: e.expectedAttendees || "Unknown",
            keyTopics: e.keyTopics || [],
            speakers: e.speakers || [],
            ticketPrice: e.ticketPrice || "Unknown",
            sponsorshipAvailable: e.sponsorshipAvailable || false,
            estimatedSponsorshipCost: e.estimatedSponsorshipCost || "Unknown",
            cfpDeadline: e.cfpDeadline || undefined,
            relevanceScore: insights.relevanceScore,
            whyAttend: insights.whyAttend,
            networkingOpportunities: insights.networkingOpportunities,
            recommendedAction: insights.recommendedAction,
          };
        })
      );
    }

    return [];
  } catch (error) {
    console.error("Event extraction error:", error);
    return [];
  }
}

/**
 * Extract event from Reddit post
 */
async function extractEventFromRedditPost(
  post: any,
  filters: EventFilters
): Promise<EventResult | null> {
  try {
    const model = await getAIModel();

    const prompt = `Extract event information from this Reddit post:

Title: ${post.title}
Content: ${post.selftext}
URL: ${post.url}

Extract:
- Event name
- Event type (conference, webinar, hackathon, meetup, summit)
- Date (YYYY-MM-DD format)
- Location (or "Virtual")
- Website/registration link
- Brief description
- Expected attendees
- Ticket price if mentioned

Respond in JSON format:
{
  "name": "Event Name",
  "eventType": "conference",
  "date": "2025-06-15",
  "location": "New York, NY",
  "website": "https://...",
  "description": "Brief description",
  "expectedAttendees": "500-1000",
  "ticketPrice": "Free"
}

If this is not a real event announcement, return null.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.name) return null;

      const insights = await generateEventInsights(parsed, filters);

      return {
        name: parsed.name,
        eventType: parsed.eventType || "meetup",
        date: parsed.date || "TBD",
        location: parsed.location || "Location TBD",
        website: parsed.website || post.url || "#",
        description: parsed.description || post.selftext.substring(0, 200),
        expectedAttendees: parsed.expectedAttendees || "Unknown",
        keyTopics: [],
        speakers: [],
        ticketPrice: parsed.ticketPrice || "Unknown",
        sponsorshipAvailable: false,
        estimatedSponsorshipCost: "Unknown",
        cfpDeadline: undefined,
        relevanceScore: insights.relevanceScore,
        whyAttend: insights.whyAttend,
        networkingOpportunities: insights.networkingOpportunities,
        recommendedAction: insights.recommendedAction,
      };
    }

    return null;
  } catch (error) {
    console.error("Reddit event extraction error:", error);
    return null;
  }
}

/**
 * Generate AI insights for an event
 */
async function generateEventInsights(
  event: any,
  filters: EventFilters
): Promise<{
  relevanceScore: number;
  whyAttend: string;
  networkingOpportunities: string;
  recommendedAction: string;
}> {
  try {
    const model = await getAIModel();

    const prompt = `Analyze this event for a ${filters.industry} company targeting ${filters.audience || "professionals"}:

Event: ${event.name}
Type: ${event.eventType}
Date: ${event.date}
Location: ${event.location}
Topics: ${event.keyTopics?.join(", ") || "General"}
Attendees: ${event.expectedAttendees}
Price: ${event.ticketPrice}

Provide:
1. Relevance Score (0-100): How relevant is this to a ${filters.industry} company?
2. Why Attend (2-3 sentences): Key benefits and opportunities
3. Networking Opportunities (1-2 sentences): Who you'll meet and connections you can make
4. Recommended Action (one word): "Attend", "Sponsor", "Speak", or "Skip"

Respond in JSON format:
{
  "relevanceScore": 85,
  "whyAttend": "Perfect for connecting with...",
  "networkingOpportunities": "You'll meet...",
  "recommendedAction": "Attend"
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.5,
    });

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        relevanceScore: parsed.relevanceScore || 70,
        whyAttend: parsed.whyAttend || "Relevant industry event with networking opportunities.",
        networkingOpportunities: parsed.networkingOpportunities || "Connect with industry professionals.",
        recommendedAction: parsed.recommendedAction || "Attend",
      };
    }

    // Fallback
    return {
      relevanceScore: 70,
      whyAttend: "Industry-relevant event with valuable networking and learning opportunities.",
      networkingOpportunities: "Meet potential partners, customers, and industry leaders.",
      recommendedAction: "Attend",
    };
  } catch (error) {
    console.error("Event insight generation error:", error);
    return {
      relevanceScore: 70,
      whyAttend: "Industry event with networking opportunities.",
      networkingOpportunities: "Connect with professionals in your field.",
      recommendedAction: "Attend",
    };
  }
}

/**
 * Quick search for events - faster, simpler version
 */
export async function quickSearchEvents(
  industry: string,
  eventType: string = "any"
): Promise<EventResult[]> {
  try {
    const query = `${industry} ${eventType !== "any" ? eventType : "events"} 2025`;
    const searchResult = await searchWeb(query);

    const events = await extractEventsFromSearchResults(searchResult.content, {
      industry,
      eventType: eventType as any,
      location: "any",
    });

    return events.slice(0, 15); // Top 15 for quick search
  } catch (error) {
    console.error("Quick event search error:", error);
    return [];
  }
}
