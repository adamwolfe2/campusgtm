"use server";

import { searchWeb, scrapeUrl } from "@/lib/scraper/jina-reader";
import { searchReddit } from "@/lib/scraper/reddit-api";
import { generateText } from "ai";
import { getAIModel } from "@/lib/ai/provider-factory";

export interface PodcastFilters {
  niche: string;
  audienceSize: "any" | "small" | "medium" | "large";
  guestFormat: boolean;
  releaseFrequency: "any" | "weekly" | "biweekly" | "monthly";
}

export interface PodcastResult {
  name: string;
  host: string;
  description: string;
  website: string;
  platforms: string[];
  episodeCount: number;
  releaseFrequency: string;
  averageLength: string;
  estimatedListeners: string;
  guestFormat: boolean;
  recentTopics: string[];
  typicalGuestProfile: string;
  audienceDescription: string;
  fitScore: number;
  whyYouFit: string;
  pitchStrategy: string;
  contactInfo: {
    email?: string;
    twitterHandle?: string;
    linkedinUrl?: string;
    guestApplicationUrl?: string;
  };
}

/**
 * Main podcast discovery function
 * Searches for podcasts that match the given criteria
 */
export async function findRelevantPodcasts(
  filters: PodcastFilters
): Promise<PodcastResult[]> {
  const podcasts: PodcastResult[] = [];

  try {
    // Step 1: Generate search queries
    const searchQueries = await generatePodcastSearchQueries(filters);

    // Step 2: Search web and Reddit in parallel
    const [webPodcasts, redditPodcasts] = await Promise.allSettled([
      searchWebForPodcasts(searchQueries, filters),
      searchRedditForPodcasts(searchQueries, filters),
    ]);

    // Combine results
    if (webPodcasts.status === "fulfilled") {
      podcasts.push(...webPodcasts.value);
    } else {
      console.error("Web podcast search failed:", webPodcasts.reason);
    }

    if (redditPodcasts.status === "fulfilled") {
      podcasts.push(...redditPodcasts.value);
    } else {
      console.error("Reddit podcast search failed:", redditPodcasts.reason);
    }

    // Step 3: Deduplicate by name (case-insensitive)
    const uniquePodcasts = Array.from(
      new Map(
        podcasts.map((p) => [p.name.toLowerCase(), p])
      ).values()
    );

    // Step 4: Filter by guest format if specified
    const filteredPodcasts = filters.guestFormat
      ? uniquePodcasts.filter((p) => p.guestFormat)
      : uniquePodcasts;

    // Step 5: Sort by fit score
    filteredPodcasts.sort((a, b) => b.fitScore - a.fitScore);

    return filteredPodcasts.slice(0, 25); // Top 25 podcasts
  } catch (error) {
    console.error("Podcast discovery error:", error);
    throw new Error(
      `Failed to find podcasts: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate smart search queries for podcasts
 */
async function generatePodcastSearchQueries(
  filters: PodcastFilters
): Promise<string[]> {
  try {
    const model = await getAIModel();

    const prompt = `Generate 5-7 search queries to find podcasts in the "${filters.niche}" niche.

Criteria:
- Niche: ${filters.niche}
- Guest Format: ${filters.guestFormat ? "Must interview guests" : "Any format"}
- Audience Size: ${filters.audienceSize}

Generate queries that would find:
1. Direct podcast names in this niche
2. "Best podcasts for [niche]" style queries
3. Reddit recommendations
4. Podcast directories and lists

Examples:
- "best ${filters.niche} podcasts"
- "${filters.niche} podcasts with guest interviews"
- "top ${filters.niche} podcasts reddit"
- "${filters.niche} podcast directory"

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
      `best ${filters.niche} podcasts`,
      `${filters.niche} podcasts with guests`,
      `top ${filters.niche} podcasts 2025`,
      `${filters.niche} podcast recommendations`,
    ];
  }
}

/**
 * Search web for podcasts
 */
async function searchWebForPodcasts(
  queries: string[],
  filters: PodcastFilters
): Promise<PodcastResult[]> {
  const podcasts: PodcastResult[] = [];

  for (const query of queries) {
    try {
      const searchResult = await searchWeb(query);

      // Extract podcasts from search results
      const extractedPodcasts = await extractPodcastsFromSearchResults(
        searchResult.content,
        filters
      );

      podcasts.push(...extractedPodcasts);
    } catch (error) {
      console.error(`Web search error for "${query}":`, error);
    }
  }

  return podcasts;
}

/**
 * Search Reddit for podcast recommendations
 */
async function searchRedditForPodcasts(
  queries: string[],
  filters: PodcastFilters
): Promise<PodcastResult[]> {
  const podcasts: PodcastResult[] = [];

  for (const query of queries) {
    try {
      const searchResults = await searchReddit(query, {
        sort: "relevance",
        time: "year",
        limit: 10,
      });

      for (const post of searchResults.posts) {
        // Check if post is asking for podcast recommendations
        const text = `${post.title} ${post.selftext}`.toLowerCase();
        const hasPodcastKeywords =
          text.includes("podcast") &&
          (text.includes("recommend") ||
            text.includes("best") ||
            text.includes("favorite") ||
            text.includes("listen to"));

        if (!hasPodcastKeywords) continue;

        // Extract podcast names from post and comments
        const extractedPodcasts = await extractPodcastsFromRedditPost(
          post,
          filters
        );
        podcasts.push(...extractedPodcasts);
      }
    } catch (error) {
      console.error(`Reddit search error for "${query}":`, error);
    }
  }

  return podcasts;
}

/**
 * Extract podcasts from web search results using AI
 */
async function extractPodcastsFromSearchResults(
  searchText: string,
  filters: PodcastFilters
): Promise<PodcastResult[]> {
  try {
    const model = await getAIModel();

    const prompt = `Extract podcast information from this search result text:

${searchText.substring(0, 12000)}

Filters:
- Niche: ${filters.niche}
- Guest Format: ${filters.guestFormat ? "Must interview guests" : "Any"}
- Audience Size: ${filters.audienceSize}

Extract podcasts with the following information:
1. Podcast name
2. Host name(s)
3. Description (2-3 sentences)
4. Website URL
5. Platforms (Spotify, Apple Podcasts, YouTube, etc.)
6. Episode count (if mentioned)
7. Release frequency ("Weekly", "Biweekly", "Monthly")
8. Average episode length ("30-45 minutes")
9. Estimated listeners ("10K-25K per episode", can estimate based on mentions)
10. Guest format (boolean - do they interview guests?)
11. Recent episode topics (array of 3-5 topics if mentioned)
12. Typical guest profile ("SaaS founders", "Marketing directors", etc.)
13. Audience description ("Growth marketers and startup founders")

Only include real, active podcasts. Skip if insufficient information.

Respond in JSON array format:
[
  {
    "name": "The SaaS Podcast",
    "host": "John Smith",
    "description": "Weekly interviews with SaaS founders...",
    "website": "https://...",
    "platforms": ["Spotify", "Apple Podcasts", "YouTube"],
    "episodeCount": 150,
    "releaseFrequency": "Weekly on Tuesdays",
    "averageLength": "45-60 minutes",
    "estimatedListeners": "25K-50K per episode",
    "guestFormat": true,
    "recentTopics": ["Product-Market Fit", "Pricing Strategy", "Sales Automation"],
    "typicalGuestProfile": "SaaS founders at Series A-B stage",
    "audienceDescription": "B2B SaaS founders and growth leaders"
  }
]

If no podcasts found, return empty array [].`;

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
        parsed.map(async (p: any) => {
          // Generate fit score and pitch strategy
          const insights = await generatePodcastInsights(p, filters);

          return {
            name: p.name,
            host: p.host || "Unknown Host",
            description: p.description || "",
            website: p.website || "#",
            platforms: p.platforms || ["Unknown"],
            episodeCount: p.episodeCount || 0,
            releaseFrequency: p.releaseFrequency || "Unknown",
            averageLength: p.averageLength || "Unknown",
            estimatedListeners: p.estimatedListeners || "Unknown",
            guestFormat: p.guestFormat || false,
            recentTopics: p.recentTopics || [],
            typicalGuestProfile: p.typicalGuestProfile || "Various guests",
            audienceDescription: p.audienceDescription || "General audience",
            fitScore: insights.fitScore,
            whyYouFit: insights.whyYouFit,
            pitchStrategy: insights.pitchStrategy,
            contactInfo: await findContactInfo(p.name, p.website),
          };
        })
      );
    }

    return [];
  } catch (error) {
    console.error("Podcast extraction error:", error);
    return [];
  }
}

/**
 * Extract podcasts from Reddit post
 */
async function extractPodcastsFromRedditPost(
  post: any,
  filters: PodcastFilters
): Promise<PodcastResult[]> {
  try {
    const model = await getAIModel();

    const prompt = `Extract podcast names and brief info from this Reddit post about podcast recommendations:

Title: ${post.title}
Content: ${post.selftext}

Context: Looking for ${filters.niche} podcasts${filters.guestFormat ? " that interview guests" : ""}.

Extract just podcast names mentioned. For each podcast, provide:
- Name
- Brief description if mentioned (or infer from context)
- Why it's recommended (if mentioned)

Respond in JSON array format:
[
  {
    "name": "Podcast Name",
    "description": "Brief description or context",
    "recommendation": "Why it was recommended"
  }
]

If no podcasts found, return empty array [].`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // For Reddit mentions, create lightweight podcast objects
      // We'll need to enrich them with more data later
      return parsed.slice(0, 5).map((p: any) => ({
        name: p.name,
        host: "Unknown",
        description: p.description || p.recommendation || "Recommended podcast",
        website: "#",
        platforms: ["Spotify", "Apple Podcasts"],
        episodeCount: 0,
        releaseFrequency: "Unknown",
        averageLength: "Unknown",
        estimatedListeners: "Unknown",
        guestFormat: filters.guestFormat,
        recentTopics: [],
        typicalGuestProfile: "Various guests",
        audienceDescription: filters.niche,
        fitScore: 70, // Default score for Reddit recommendations
        whyYouFit: `Recommended in ${filters.niche} community discussions.`,
        pitchStrategy: "Research the podcast and reach out via their website contact form.",
        contactInfo: {},
      }));
    }

    return [];
  } catch (error) {
    console.error("Reddit podcast extraction error:", error);
    return [];
  }
}

/**
 * Generate AI insights for a podcast
 */
async function generatePodcastInsights(
  podcast: any,
  filters: PodcastFilters
): Promise<{
  fitScore: number;
  whyYouFit: string;
  pitchStrategy: string;
}> {
  try {
    const model = await getAIModel();

    const prompt = `Analyze if this podcast is a good fit for a ${filters.niche} expert:

Podcast: ${podcast.name}
Host: ${podcast.host}
Description: ${podcast.description}
Typical Guests: ${podcast.typicalGuestProfile}
Audience: ${podcast.audienceDescription}
Recent Topics: ${podcast.recentTopics?.join(", ") || "Various"}

Your Profile: ${filters.niche} expert/founder

Provide:
1. Fit Score (0-100): How well do you match their typical guest profile and audience?
2. Why You Fit (2-3 sentences): Explain the alignment between your expertise and their content
3. Pitch Strategy (2-3 sentences): How to approach the host, what angle to pitch, unique value you bring

Respond in JSON format:
{
  "fitScore": 85,
  "whyYouFit": "Your expertise in...",
  "pitchStrategy": "Lead with your story about... Emphasize how your experience with..."
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.6,
    });

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        fitScore: parsed.fitScore || 70,
        whyYouFit:
          parsed.whyYouFit ||
          "Your expertise aligns with their typical guest profile and audience interests.",
        pitchStrategy:
          parsed.pitchStrategy ||
          "Reach out with a specific story or insight that matches their recent episode topics.",
      };
    }

    // Fallback
    return {
      fitScore: 70,
      whyYouFit: "Your background matches their guest profile and audience interests.",
      pitchStrategy: "Pitch a specific topic that aligns with their recent episodes and audience needs.",
    };
  } catch (error) {
    console.error("Podcast insight generation error:", error);
    return {
      fitScore: 70,
      whyYouFit: "Relevant expertise for their audience.",
      pitchStrategy: "Research recent episodes and pitch a unique angle.",
    };
  }
}

/**
 * Find contact information for a podcast
 */
async function findContactInfo(
  podcastName: string,
  website: string
): Promise<{
  email?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  guestApplicationUrl?: string;
}> {
  if (!website || website === "#") {
    return {};
  }

  try {
    // Scrape podcast website for contact info
    const scrapedPage = await scrapeUrl(website);

    const model = await getAIModel();

    const prompt = `Extract contact information from this podcast website:

${scrapedPage.content.substring(0, 5000)}

Find:
1. Email address for guest inquiries
2. Twitter handle
3. LinkedIn URL
4. Guest application/booking form URL

Respond in JSON format:
{
  "email": "guest@podcast.com",
  "twitterHandle": "@podcastname",
  "linkedinUrl": "https://linkedin.com/...",
  "guestApplicationUrl": "https://podcast.com/be-a-guest"
}

If information not found, omit the field.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.2,
    });

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        email: parsed.email,
        twitterHandle: parsed.twitterHandle,
        linkedinUrl: parsed.linkedinUrl,
        guestApplicationUrl: parsed.guestApplicationUrl,
      };
    }

    return {};
  } catch (error) {
    console.error("Contact info extraction error:", error);
    return {};
  }
}

/**
 * Quick search for podcasts - simpler, faster version
 */
export async function quickSearchPodcasts(
  niche: string
): Promise<PodcastResult[]> {
  try {
    const query = `best ${niche} podcasts 2025`;
    const searchResult = await searchWeb(query);

    const podcasts = await extractPodcastsFromSearchResults(
      searchResult.content,
      {
        niche,
        audienceSize: "any",
        guestFormat: false,
        releaseFrequency: "any",
      }
    );

    return podcasts.slice(0, 12); // Top 12 for quick search
  } catch (error) {
    console.error("Quick podcast search error:", error);
    return [];
  }
}
