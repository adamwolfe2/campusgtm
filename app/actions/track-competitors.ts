"use server";

import { searchWeb, scrapeUrl } from "@/lib/scraper/jina-reader";
import { searchReddit } from "@/lib/scraper/reddit-api";
import { generateText } from "ai";
import { getAIModel } from "@/lib/ai/provider-factory";
import crypto from "crypto";

export interface Competitor {
  id: string;
  workspaceId: string;
  name: string;
  website: string;
  description: string;
  trackedUrls: string[];
  socialAccounts: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorSnapshot {
  id: string;
  competitorId: string;
  url: string;
  contentHash: string;
  content: string;
  metadata: {
    pricing?: string[];
    features?: string[];
    teamSize?: string;
    latestUpdates?: string[];
    lastModified?: string;
  };
  scrapedAt: Date;
}

export interface CompetitorChange {
  id: string;
  competitorId: string;
  url: string;
  changeType: "pricing" | "feature" | "content" | "design" | "other";
  summary: string;
  oldContent: string;
  newContent: string;
  impactScore: number;
  status: "new" | "reviewed" | "actioned";
  detectedAt: Date;
}

/**
 * Find competitors for a company using web search + Reddit
 * Returns a list of potential competitors with basic info
 */
export async function findCompetitors(
  companyName: string,
  industry: string
): Promise<{
  name: string;
  website: string;
  description: string;
  source: string;
}[]> {
  const competitors: {
    name: string;
    website: string;
    description: string;
    source: string;
  }[] = [];

  try {
    // Step 1: Web search for competitors
    const webQuery = `${companyName} competitors in ${industry}`;
    const webSearchResults = await searchWeb(webQuery);

    // Use AI to extract competitor information from web search
    const webCompetitors = await extractCompetitorsFromText(
      webSearchResults.content,
      companyName,
      industry
    );
    competitors.push(...webCompetitors.map(c => ({ ...c, source: 'web' })));

    // Step 2: Reddit search for competitor discussions
    const redditQuery = `${industry} alternatives ${companyName}`;
    const redditResults = await searchReddit(redditQuery, {
      sort: 'relevance',
      time: 'year',
      limit: 10,
    });

    // Extract competitor mentions from Reddit discussions
    const redditCompetitors = await extractCompetitorsFromReddit(
      redditResults.posts,
      companyName,
      industry
    );
    competitors.push(...redditCompetitors.map(c => ({ ...c, source: 'reddit' })));

    // Deduplicate by website
    const uniqueCompetitors = Array.from(
      new Map(competitors.map(c => [c.website, c])).values()
    );

    return uniqueCompetitors.slice(0, 20); // Top 20 competitors
  } catch (error) {
    console.error('Competitor finding error:', error);
    throw new Error(`Failed to find competitors: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract competitor information from web search results using AI
 */
async function extractCompetitorsFromText(
  searchText: string,
  companyName: string,
  industry: string
): Promise<{ name: string; website: string; description: string }[]> {
  try {
    const model = await getAIModel();

    const prompt = `Extract competitor companies from this search result text:

${searchText.substring(0, 10000)}

Context:
- Target Company: ${companyName}
- Industry: ${industry}

Extract ONLY direct competitors (companies offering similar products/services in the same market).
Do NOT include:
- The target company itself
- Investors, partners, or service providers
- General industry terms or categories

For each competitor found, extract:
1. Company name
2. Website URL (full URL, not just domain)
3. Brief description (1-2 sentences about what they do)

Respond in JSON array format:
[
  {
    "name": "Competitor Name",
    "website": "https://example.com",
    "description": "Brief description of what they do"
  }
]

If you can't find any competitors, return empty array [].`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.filter((c: any) =>
        c.name &&
        c.website &&
        c.name.toLowerCase() !== companyName.toLowerCase()
      );
    }

    return [];
  } catch (error) {
    console.error('Competitor extraction error:', error);
    return [];
  }
}

/**
 * Extract competitor mentions from Reddit posts
 */
async function extractCompetitorsFromReddit(
  posts: any[],
  companyName: string,
  industry: string
): Promise<{ name: string; website: string; description: string }[]> {
  try {
    const model = await getAIModel();

    // Combine post titles and content
    const redditContent = posts
      .map(p => `${p.title}\n${p.selftext}`)
      .join('\n\n---\n\n')
      .substring(0, 8000);

    const prompt = `Extract competitor companies mentioned in these Reddit discussions:

${redditContent}

Context:
- Target Company: ${companyName}
- Industry: ${industry}

Look for mentions of alternative products/services or direct competitors.
For each competitor found, provide:
1. Company name
2. Website URL (infer from company name if not explicitly mentioned, use format: https://companyname.com)
3. Brief description based on context

Respond in JSON array format:
[
  {
    "name": "Competitor Name",
    "website": "https://example.com",
    "description": "What they do based on Reddit discussion"
  }
]

If you can't find any competitors, return empty array [].`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.filter((c: any) =>
        c.name &&
        c.website &&
        c.name.toLowerCase() !== companyName.toLowerCase()
      );
    }

    return [];
  } catch (error) {
    console.error('Reddit competitor extraction error:', error);
    return [];
  }
}

/**
 * Take a snapshot of a competitor's website
 * Scrapes the site and extracts structured data about pricing, features, etc.
 */
export async function snapshotCompetitor(
  competitorUrl: string
): Promise<{
  url: string;
  contentHash: string;
  content: string;
  metadata: {
    pricing?: string[];
    features?: string[];
    teamSize?: string;
    latestUpdates?: string[];
    lastModified?: string;
  };
}> {
  try {
    // Scrape the competitor's website
    const scrapedPage = await scrapeUrl(competitorUrl);

    // Generate content hash for change detection
    const contentHash = crypto
      .createHash('md5')
      .update(scrapedPage.content)
      .digest('hex');

    // Use AI to extract structured information
    const metadata = await extractCompetitorMetadata(scrapedPage.content);

    return {
      url: competitorUrl,
      contentHash,
      content: scrapedPage.content,
      metadata,
    };
  } catch (error) {
    console.error('Snapshot error:', error);
    throw new Error(`Failed to snapshot competitor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract structured metadata from competitor website content
 */
async function extractCompetitorMetadata(
  content: string
): Promise<{
  pricing?: string[];
  features?: string[];
  teamSize?: string;
  latestUpdates?: string[];
  lastModified?: string;
}> {
  try {
    const model = await getAIModel();

    const prompt = `Analyze this competitor website content and extract key information:

${content.substring(0, 12000)}

Extract the following information (if available):
1. Pricing: List all pricing tiers/plans mentioned (e.g., ["Free: $0/mo", "Pro: $49/mo", "Enterprise: Custom"])
2. Features: List top 5-7 key features highlighted on the site
3. Team Size: Estimate team size if mentioned (e.g., "50-100 employees", "15+ team members")
4. Latest Updates: Any recent announcements, product launches, or news (last 3 months)
5. Last Modified: Any date information suggesting when the site was last updated

Respond in JSON format:
{
  "pricing": ["Free: $0/mo", "Pro: $49/mo"],
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "teamSize": "50-100 employees",
  "latestUpdates": ["Launched feature X in Nov 2024", "Raised Series A"],
  "lastModified": "November 2024"
}

If information is not available, omit that field. Return empty object {} if nothing can be extracted.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.2,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {};
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return {};
  }
}

/**
 * Detect changes between two snapshots of the same competitor
 * Compares content and identifies significant changes
 */
export async function detectChanges(
  competitorName: string,
  oldSnapshot: {
    content: string;
    metadata: Record<string, any>;
  },
  newSnapshot: {
    content: string;
    metadata: Record<string, any>;
  }
): Promise<{
  changeType: "pricing" | "feature" | "content" | "design" | "other";
  summary: string;
  oldContent: string;
  newContent: string;
  impactScore: number;
}[]> {
  try {
    // Quick check: if content hashes are the same, no changes
    const oldHash = crypto.createHash('md5').update(oldSnapshot.content).digest('hex');
    const newHash = crypto.createHash('md5').update(newSnapshot.content).digest('hex');

    if (oldHash === newHash) {
      return []; // No changes detected
    }

    // Use AI to analyze what changed
    const changes = await analyzeChanges(
      competitorName,
      oldSnapshot,
      newSnapshot
    );

    return changes;
  } catch (error) {
    console.error('Change detection error:', error);
    throw new Error(`Failed to detect changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Use AI to analyze what changed between snapshots
 */
async function analyzeChanges(
  competitorName: string,
  oldSnapshot: {
    content: string;
    metadata: Record<string, any>;
  },
  newSnapshot: {
    content: string;
    metadata: Record<string, any>;
  }
): Promise<{
  changeType: "pricing" | "feature" | "content" | "design" | "other";
  summary: string;
  oldContent: string;
  newContent: string;
  impactScore: number;
}[]> {
  try {
    const model = await getAIModel();

    // Compare metadata first (more structured)
    const metadataComparison = `
OLD METADATA:
${JSON.stringify(oldSnapshot.metadata, null, 2)}

NEW METADATA:
${JSON.stringify(newSnapshot.metadata, null, 2)}
`;

    // Sample content for comparison (use first 3000 chars of each)
    const oldContentSample = oldSnapshot.content.substring(0, 3000);
    const newContentSample = newSnapshot.content.substring(0, 3000);

    const prompt = `Analyze changes in competitor website for: ${competitorName}

${metadataComparison}

OLD CONTENT SAMPLE:
${oldContentSample}

NEW CONTENT SAMPLE:
${newContentSample}

Identify ALL significant changes. For each change, provide:
1. changeType: "pricing", "feature", "content", "design", or "other"
2. summary: Brief description of the change (1-2 sentences)
3. oldContent: What it was before (brief excerpt or description)
4. newContent: What it is now (brief excerpt or description)
5. impactScore: 0-100 (how important is this for competitive intelligence)
   - 90-100: Critical (major pricing change, new product launch)
   - 70-89: High (new feature, significant update)
   - 50-69: Medium (content refresh, minor feature)
   - 30-49: Low (minor text changes)
   - 0-29: Trivial (formatting, typos)

Prioritize changes related to:
- Pricing adjustments
- New features or products
- Team/company growth
- Major announcements

Respond in JSON array format:
[
  {
    "changeType": "pricing",
    "summary": "Reduced Pro plan price from $99 to $79/mo",
    "oldContent": "Pro: $99/mo",
    "newContent": "Pro: $79/mo",
    "impactScore": 95
  }
]

If no significant changes detected, return empty array [].`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.2,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Filter out low-impact changes
      return parsed.filter((change: any) => change.impactScore >= 40);
    }

    return [];
  } catch (error) {
    console.error('Change analysis error:', error);
    return [];
  }
}
