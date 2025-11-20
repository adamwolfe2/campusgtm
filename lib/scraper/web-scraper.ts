/**
 * Web Scraper Service
 * Extracts context and insights from company websites
 * Inspired by searchable.com's onboarding experience
 */

import * as cheerio from "cheerio";
import axios from "axios";

export interface ScrapedWebsiteData {
  url: string;
  title: string;
  description: string;
  mainContent: string;
  headings: string[];
  links: string[];
  metadata: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    keywords?: string[];
  };
  extractedAt: Date;
}

export interface WebsiteInsights {
  companyName: string;
  tagline: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  valueProposition: string;
  industry: string;
}

/**
 * Scrapes a website and extracts structured data
 * Tries Jina AI Reader first (more reliable), falls back to direct scraping
 */
export async function scrapeWebsite(
  url: string
): Promise<ScrapedWebsiteData> {
  try {
    // Normalize URL
    const normalizedUrl = normalizeUrl(url);

    // Try Jina AI Reader first (more reliable, handles CORS/JS)
    try {
      return await scrapeWebsiteWithJina(normalizedUrl);
    } catch (jinaError) {
      console.log('Jina AI scraping failed, trying direct scraping...', jinaError);

      // Fallback to direct scraping
      return await scrapeWebsiteDirect(normalizedUrl);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ENOTFOUND") {
        throw new Error("Website not found. Please check the URL.");
      }
      if (error.code === "ETIMEDOUT") {
        throw new Error("Request timed out. Please try again.");
      }
      if (error.response?.status === 403) {
        throw new Error("Access denied by website.");
      }
      if (error.response?.status === 404) {
        throw new Error("Page not found.");
      }
    }

    throw new Error(
      `Failed to scrape website: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Direct scraping using Cheerio (original method)
 */
async function scrapeWebsiteDirect(
  normalizedUrl: string
): Promise<ScrapedWebsiteData> {
  // Fetch the HTML
  const response = await axios.get(normalizedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; CampusGTM/1.0; +https://campusgtm.com)",
    },
    timeout: 10000, // 10 second timeout
    maxRedirects: 5,
  });

  const html = response.data;
  const $ = cheerio.load(html);

  // Extract metadata
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text() ||
    "";

  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    "";

  const ogImage = $('meta[property="og:image"]').attr("content");

  const keywords =
    $('meta[name="keywords"]')
      .attr("content")
      ?.split(",")
      .map((k) => k.trim()) || [];

  // Extract headings
  const headings: string[] = [];
  $("h1, h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      headings.push(text);
    }
  });

  // Extract main content (remove scripts, styles, nav, footer)
  $("script, style, nav, footer, header, aside, .cookie-banner").remove();

  const mainContent = $("main, article, .content, #content")
    .first()
    .text()
    .trim();

  // Fallback to body if no main content found
  const content =
    mainContent ||
    $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 5000); // Limit to 5000 chars

  // Extract internal links
  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      links.push(href);
    }
  });

  return {
    url: normalizedUrl,
    title: cleanText(title),
    description: cleanText(description),
    mainContent: cleanText(content),
    headings: headings.slice(0, 10).map(cleanText), // Top 10 headings
    links: [...new Set(links)].slice(0, 20), // Unique links, max 20
    metadata: {
      ogTitle: title,
      ogDescription: description,
      ogImage,
      keywords,
    },
    extractedAt: new Date(),
  };
}

/**
 * Scrapes using Jina AI Reader (fallback for CORS/protected sites)
 * Free API that converts any URL to clean markdown
 */
async function scrapeWebsiteWithJina(
  url: string
): Promise<ScrapedWebsiteData> {
  const response = await axios.get(`https://r.jina.ai/${url}`, {
    headers: {
      'Accept': 'application/json',
      'X-Return-Format': 'json',
    },
    timeout: 15000,
  });

  const data = response.data;

  // Jina returns markdown content
  const content = data.content || data.data?.content || '';

  // Extract headings from markdown
  const headings: string[] = [];
  const headingMatches = content.matchAll(/^#{1,3}\s+(.+)$/gm);
  for (const match of headingMatches) {
    headings.push(match[1].trim());
  }

  return {
    url,
    title: cleanText(data.title || data.data?.title || ''),
    description: cleanText(data.description || data.data?.description || ''),
    mainContent: cleanText(content.substring(0, 5000)),
    headings: headings.slice(0, 10),
    links: [], // Jina doesn't provide links easily
    metadata: {
      ogTitle: data.title,
      ogDescription: data.description,
      ogImage: data.image || data.data?.image,
      keywords: [],
    },
    extractedAt: new Date(),
  };
}

/**
 * Extracts insights from scraped data using AI
 * This will be called after scraping to generate structured insights
 */
export function extractInsightsFromScrapedData(
  data: ScrapedWebsiteData
): string {
  // Build a context string for AI processing
  let context = `Company Website Analysis:\n\n`;
  context += `URL: ${data.url}\n`;
  context += `Title: ${data.title}\n`;
  context += `Description: ${data.description}\n\n`;

  if (data.headings.length > 0) {
    context += `Key Headings:\n${data.headings.map((h) => `- ${h}`).join("\n")}\n\n`;
  }

  context += `Main Content:\n${data.mainContent.substring(0, 2000)}\n`;

  return context;
}

/**
 * Generates a prompt for AI to extract structured insights
 */
export function generateInsightExtractionPrompt(
  scrapedData: ScrapedWebsiteData
): string {
  const context = extractInsightsFromScrapedData(scrapedData);

  return `Analyze this company website and extract key information:

${context}

Extract the following information in a structured format:
1. Company Name
2. Tagline/Value Proposition
3. Brief Description (1-2 sentences)
4. Key Features/Products (list 3-5)
5. Target Audience (be specific)
6. Industry/Category
7. Unique Selling Points

Format your response as JSON with these exact keys:
{
  "companyName": "...",
  "tagline": "...",
  "description": "...",
  "keyFeatures": ["...", "..."],
  "targetAudience": "...",
  "valueProposition": "...",
  "industry": "..."
}`;
}

/**
 * Normalizes a URL (adds https:// if missing)
 */
function normalizeUrl(url: string): string {
  let normalized = url.trim();

  // Add protocol if missing
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, "");

  return normalized;
}

/**
 * Cleans extracted text
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\n+/g, " ") // Remove newlines
    .trim();
}

/**
 * Validates a URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const normalized = normalizeUrl(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const normalized = normalizeUrl(url);
    const { hostname } = new URL(normalized);
    return hostname.replace("www.", "");
  } catch {
    return "";
  }
}
