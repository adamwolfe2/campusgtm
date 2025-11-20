"use server";

import { searchWeb, scrapeUrl } from "@/lib/scraper/jina-reader";
import { searchReddit, searchSubreddits } from "@/lib/scraper/reddit-api";
import { generateText } from "ai";
import { getAIModel } from "@/lib/ai/provider-factory";

export interface PartnershipFilters {
  industry: string;
  companyStage: 'startup' | 'scaleup' | 'enterprise';
  partnershipType: 'co-marketing' | 'integration' | 'referral' | 'content' | 'all';
  targetAudience: string; // Your ICP
  excludeCompetitors?: boolean;
}

export interface PartnershipResult {
  companyName: string;
  website: string;
  description: string;
  industry: string;
  estimatedSize: string; // "10-50 employees"
  sharedAudience: string; // "B2B SaaS founders, growth stage"
  partnershipType: string[]; // ["co-marketing", "integration"]
  complementaryProducts: string; // How products complement each other
  mutualBenefitScore: number; // 0-100
  outreachStrategy: string; // Personalized partnership pitch
  contactInfo: {
    linkedinUrl?: string;
    email?: string;
    foundersName?: string;
  };
}

/**
 * Main discovery function for finding partnership opportunities
 * Uses multi-stage discovery: Complementary product search -> Reddit community analysis -> Content collaboration opportunities
 */
export async function findPartnershipOpportunities(
  filters: PartnershipFilters
): Promise<PartnershipResult[]> {
  const partnerships: PartnershipResult[] = [];

  try {
    // Step 1: Web search for complementary products
    const webPartners = await searchComplementaryProducts(filters);
    partnerships.push(...webPartners);

    // Step 2: Reddit community analysis - find companies active in same communities
    const redditPartners = await findRedditCommunityPartners(filters);
    partnerships.push(...redditPartners);

    // Step 3: Content co-creation opportunities
    const contentPartners = await findContentPartners(filters);
    partnerships.push(...contentPartners);

    // Step 4: Deduplicate and sort by mutual benefit score
    const uniquePartners = Array.from(
      new Map(partnerships.map(p => [p.website.toLowerCase(), p])).values()
    );

    uniquePartners.sort((a, b) => b.mutualBenefitScore - a.mutualBenefitScore);

    return uniquePartners.slice(0, 25); // Top 25 results
  } catch (error) {
    console.error('Partnership finding error:', error);
    throw new Error(
      `Failed to find partnerships: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Search for complementary (non-competing) products serving same ICP
 */
async function searchComplementaryProducts(
  filters: PartnershipFilters
): Promise<PartnershipResult[]> {
  try {
    // Build search query
    const partnershipTypeQuery = filters.partnershipType === 'all'
      ? 'partnerships integration'
      : filters.partnershipType;

    const searchQuery = `${filters.industry} ${partnershipTypeQuery} companies serving ${filters.targetAudience}`;

    // Search web
    const searchResults = await searchWeb(searchQuery);

    // Use AI to extract potential partners
    const partners = await extractPartnersFromText(
      searchResults.content,
      filters,
      'complementary'
    );

    return partners;
  } catch (error) {
    console.error('Complementary product search error:', error);
    return [];
  }
}

/**
 * Find companies active in the same Reddit communities
 */
async function findRedditCommunityPartners(
  filters: PartnershipFilters
): Promise<PartnershipResult[]> {
  const partners: PartnershipResult[] = [];

  try {
    // Find relevant subreddits
    const subreddits = await searchSubreddits(filters.industry, 5);

    // Analyze companies mentioned in these communities
    for (const subreddit of subreddits.slice(0, 3)) {
      try {
        const posts = await searchReddit(filters.targetAudience, {
          subreddit: subreddit.display_name,
          sort: 'top',
          time: 'month',
          limit: 20,
        });

        // Extract company mentions
        const companyMentions = await extractCompanyMentions(
          posts.posts,
          filters
        );

        partners.push(...companyMentions);
      } catch (error) {
        console.error(`Reddit community analysis error for ${subreddit.display_name}:`, error);
      }
    }

    return partners;
  } catch (error) {
    console.error('Reddit community partner search error:', error);
    return [];
  }
}

/**
 * Find companies creating similar content (potential content partners)
 */
async function findContentPartners(
  filters: PartnershipFilters
): Promise<PartnershipResult[]> {
  try {
    const searchQuery = `${filters.industry} companies creating content for ${filters.targetAudience}`;

    const searchResults = await searchWeb(searchQuery);

    const partners = await extractPartnersFromText(
      searchResults.content,
      filters,
      'content'
    );

    return partners;
  } catch (error) {
    console.error('Content partner search error:', error);
    return [];
  }
}

/**
 * Extract company mentions from Reddit posts
 */
async function extractCompanyMentions(
  posts: any[],
  filters: PartnershipFilters
): Promise<PartnershipResult[]> {
  try {
    const model = await getAIModel();

    // Combine post content
    const postContent = posts
      .map(p => `${p.title}\n${p.selftext}`)
      .join('\n\n---\n\n')
      .substring(0, 8000);

    const prompt = `Extract companies mentioned in these Reddit discussions that could be good partnership opportunities:

${postContent}

Context:
- Industry: ${filters.industry}
- Target Audience: ${filters.targetAudience}
- Partnership Type: ${filters.partnershipType}
- Company Stage: ${filters.companyStage}

Look for companies that:
1. Serve the same audience but aren't direct competitors
2. Offer complementary products/services
3. Are mentioned positively by the community
4. Are at a similar stage (${filters.companyStage})

For each company found, provide:
1. Company name
2. Website (infer from name if not mentioned)
3. Description
4. How they complement your offering
5. Mutual benefit score (0-100)

Respond in JSON array format:
[
  {
    "companyName": "Partner Company",
    "website": "https://example.com",
    "description": "What they do",
    "industry": "${filters.industry}",
    "estimatedSize": "10-50 employees",
    "sharedAudience": "Who they both serve",
    "partnershipType": ["co-marketing", "integration"],
    "complementaryProducts": "How products work together",
    "mutualBenefitScore": 85,
    "outreachStrategy": "Personalized approach",
    "contactInfo": {
      "linkedinUrl": "https://linkedin.com/company/..."
    }
  }
]

If you can't find any companies, return empty array [].`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    return [];
  } catch (error) {
    console.error('Company mention extraction error:', error);
    return [];
  }
}

/**
 * Extract partnership opportunities from web search results
 */
async function extractPartnersFromText(
  searchText: string,
  filters: PartnershipFilters,
  searchType: 'complementary' | 'content'
): Promise<PartnershipResult[]> {
  try {
    const model = await getAIModel();

    const searchTypeContext = searchType === 'complementary'
      ? 'companies offering complementary (non-competing) products/services'
      : 'companies creating content for the same audience';

    const prompt = `Extract potential partnership opportunities from this search result text:

${searchText.substring(0, 10000)}

Context:
- Industry: ${filters.industry}
- Target Audience: ${filters.targetAudience}
- Partnership Type: ${filters.partnershipType}
- Company Stage: ${filters.companyStage}
- Search Focus: ${searchTypeContext}

Extract companies that would make good partners. ${filters.excludeCompetitors ? 'EXCLUDE direct competitors.' : ''}

Criteria:
1. Serve similar/same audience
2. Non-competing offerings
3. Similar company stage
4. Clear mutual benefit potential

For each company found, extract:
1. Company name
2. Website URL
3. Description (1-2 sentences)
4. Industry
5. Estimated size (employees/revenue stage)
6. Shared audience description
7. Partnership types that would work (array)
8. How products/services complement each other
9. Mutual benefit score (0-100)
10. Outreach strategy (personalized pitch)
11. Contact info (LinkedIn, email, founder name if available)

Respond in JSON array format:
[
  {
    "companyName": "Company Name",
    "website": "https://example.com",
    "description": "Brief description",
    "industry": "${filters.industry}",
    "estimatedSize": "25-50 employees",
    "sharedAudience": "B2B SaaS founders, growth stage",
    "partnershipType": ["co-marketing", "integration"],
    "complementaryProducts": "Detailed explanation of how products complement",
    "mutualBenefitScore": 88,
    "outreachStrategy": "Personalized partnership pitch based on their positioning",
    "contactInfo": {
      "linkedinUrl": "https://linkedin.com/company/name",
      "email": "partnerships@example.com",
      "foundersName": "Jane Doe"
    }
  }
]

Prioritize companies with:
- Strong mutual benefit (score 70+)
- Clear complementary positioning
- Active in the same communities/spaces
- Similar stage/culture fit

If you can't find any partners, return empty array [].`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Filter by mutual benefit score
      return parsed.filter((p: any) => p.mutualBenefitScore >= 60);
    }

    return [];
  } catch (error) {
    console.error('Partner extraction error:', error);
    return [];
  }
}

/**
 * Analyze integration potential between two products
 * Used to score technical partnership fit
 */
export async function analyzeIntegrationPotential(
  yourProduct: {
    name: string;
    description: string;
    techStack?: string;
  },
  partnerProduct: {
    name: string;
    description: string;
    website: string;
  }
): Promise<{
  integrationScore: number; // 0-100
  technicalFit: string;
  integrationIdeas: string[];
  estimatedEffort: string;
}> {
  try {
    const model = await getAIModel();

    // Scrape partner website for technical details
    const partnerPage = await scrapeUrl(partnerProduct.website);

    const prompt = `Analyze integration potential between two products:

YOUR PRODUCT:
Name: ${yourProduct.name}
Description: ${yourProduct.description}
${yourProduct.techStack ? `Tech Stack: ${yourProduct.techStack}` : ''}

PARTNER PRODUCT:
Name: ${partnerProduct.name}
Description: ${partnerProduct.description}

Partner Website Content (for technical insights):
${partnerPage.content.substring(0, 5000)}

Analyze:
1. Integration Score (0-100): How well would these products integrate?
2. Technical Fit: API availability, common data models, integration complexity
3. Integration Ideas: 3-5 specific integration scenarios
4. Estimated Effort: How long would integration take (hours/days/weeks)

Consider:
- Do they have an API?
- Are there common use cases?
- Would users benefit from the integration?
- Technical complexity

Respond in JSON format:
{
  "integrationScore": 85,
  "technicalFit": "Both products use REST APIs with webhooks. Strong technical compatibility.",
  "integrationIdeas": [
    "Bi-directional data sync between platforms",
    "Single sign-on (SSO) integration",
    "Embedded widget in partner product"
  ],
  "estimatedEffort": "2-3 weeks for MVP integration"
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      integrationScore: 50,
      technicalFit: 'Integration potential unclear from available information.',
      integrationIdeas: ['API integration', 'Data exchange', 'Co-marketing campaign'],
      estimatedEffort: 'Needs technical discovery',
    };
  } catch (error) {
    console.error('Integration analysis error:', error);
    return {
      integrationScore: 0,
      technicalFit: 'Unable to analyze integration potential.',
      integrationIdeas: [],
      estimatedEffort: 'Unknown',
    };
  }
}

/**
 * Generate a personalized partnership outreach email
 */
export async function generatePartnershipEmail(
  partner: PartnershipResult,
  yourCompany: {
    name: string;
    description: string;
    website: string;
  },
  senderName: string
): Promise<{
  subject: string;
  body: string;
}> {
  try {
    const model = await getAIModel();

    const prompt = `Generate a personalized partnership outreach email:

YOUR COMPANY:
Name: ${yourCompany.name}
Description: ${yourCompany.description}
Website: ${yourCompany.website}

PARTNER COMPANY:
Name: ${partner.companyName}
Description: ${partner.description}
Shared Audience: ${partner.sharedAudience}
Partnership Types: ${partner.partnershipType.join(', ')}
Complementary Products: ${partner.complementaryProducts}

SENDER:
Name: ${senderName}

Write a warm, professional partnership email that:
1. Shows you've researched their company
2. Clearly states the mutual benefit
3. Proposes specific partnership ideas
4. Includes a clear call-to-action
5. Keeps it under 150 words

Tone: Professional but friendly, value-focused

Respond in JSON format:
{
  "subject": "Partnership opportunity: [Specific benefit]",
  "body": "Email body here..."
}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      subject: `Partnership opportunity: ${yourCompany.name} x ${partner.companyName}`,
      body: `Hi,\n\nI'm ${senderName} from ${yourCompany.name}. I've been following ${partner.companyName} and think there's a great partnership opportunity.\n\nBoth our companies serve ${partner.sharedAudience}, and I see potential for ${partner.partnershipType[0]}.\n\nWould you be open to a quick call to explore this?\n\nBest,\n${senderName}`,
    };
  } catch (error) {
    console.error('Email generation error:', error);
    throw error;
  }
}

/**
 * Quick search for partnership opportunities
 */
export async function quickSearchPartnerships(
  industry: string,
  targetAudience: string
): Promise<PartnershipResult[]> {
  return findPartnershipOpportunities({
    industry,
    companyStage: 'startup',
    partnershipType: 'all',
    targetAudience,
    excludeCompetitors: true,
  });
}
