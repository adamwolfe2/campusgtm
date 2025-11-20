/**
 * Jina Reader Service
 * Free web scraping service that converts any URL to clean markdown
 * Docs: https://jina.ai/reader
 */

interface JinaReaderResponse {
  code: number;
  status: number;
  data: {
    title: string;
    content: string;
    url: string;
    usage: {
      tokens: number;
    };
  };
}

export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  markdown: string;
  tokens: number;
}

/**
 * Scrape a URL using Jina Reader
 * Returns clean markdown content
 */
export async function scrapeUrl(url: string): Promise<ScrapedPage> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;

    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'markdown',
      },
    });

    if (!response.ok) {
      throw new Error(`Jina Reader API error: ${response.statusText}`);
    }

    const text = await response.text();

    // Jina returns markdown directly in the response body
    const markdown = text;

    // Extract title from markdown (first # heading)
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : new URL(url).hostname;

    return {
      url,
      title,
      content: markdown,
      markdown,
      tokens: Math.ceil(markdown.length / 4), // Rough token estimate
    };
  } catch (error) {
    console.error('Jina Reader scraping error:', error);
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search the web using Jina Reader
 * Useful for finding communities, competitors, etc.
 */
export async function searchWeb(query: string): Promise<ScrapedPage> {
  try {
    // Use Jina's search feature with Google
    const searchUrl = `https://s.jina.ai/${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'markdown',
      },
    });

    if (!response.ok) {
      throw new Error(`Jina Search API error: ${response.statusText}`);
    }

    const markdown = await response.text();

    return {
      url: searchUrl,
      title: `Search: ${query}`,
      content: markdown,
      markdown,
      tokens: Math.ceil(markdown.length / 4),
    };
  } catch (error) {
    console.error('Jina Search error:', error);
    throw new Error(`Failed to search web: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Batch scrape multiple URLs
 */
export async function scrapeUrls(urls: string[]): Promise<ScrapedPage[]> {
  const results = await Promise.allSettled(
    urls.map(url => scrapeUrl(url))
  );

  return results
    .filter((result): result is PromiseFulfilledResult<ScrapedPage> => result.status === 'fulfilled')
    .map(result => result.value);
}
