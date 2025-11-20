/**
 * Hacker News API Service
 * Uses Algolia's HN Search API (free, no auth required)
 * Docs: https://hn.algolia.com/api
 */

export interface HNStory {
  objectID: string;
  title: string;
  url: string | null; // Null for Ask HN, Show HN text posts
  author: string;
  points: number;
  num_comments: number;
  created_at: string;
  created_at_i: number; // Unix timestamp
  story_text: string | null; // Text content for self posts
}

export interface HNSearchResult {
  hits: HNStory[];
  nbHits: number;
  page: number;
  nbPages: number;
}

/**
 * Search Hacker News for stories
 */
export async function searchHackerNews(
  query: string,
  options: {
    tags?: string; // 'story', 'comment', 'poll', 'show_hn', 'ask_hn', 'front_page'
    numericFilters?: string; // e.g., 'points>10,num_comments>5'
    page?: number;
    hitsPerPage?: number;
  } = {}
): Promise<HNSearchResult> {
  try {
    const { tags = 'story', page = 0, hitsPerPage = 20, numericFilters } = options;

    const params = new URLSearchParams({
      query,
      tags,
      page: page.toString(),
      hitsPerPage: hitsPerPage.toString(),
    });

    if (numericFilters) {
      params.append('numericFilters', numericFilters);
    }

    const response = await fetch(
      `https://hn.algolia.com/api/v1/search?${params}`
    );

    if (!response.ok) {
      throw new Error(`HN API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      hits: data.hits.map((hit: any) => ({
        objectID: hit.objectID,
        title: hit.title || '',
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        author: hit.author,
        points: hit.points || 0,
        num_comments: hit.num_comments || 0,
        created_at: hit.created_at,
        created_at_i: hit.created_at_i,
        story_text: hit.story_text || null,
      })),
      nbHits: data.nbHits,
      page: data.page,
      nbPages: data.nbPages,
    };
  } catch (error) {
    console.error('Hacker News search error:', error);
    throw new Error(`Failed to search HN: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get front page stories
 */
export async function getFrontPage(limit: number = 30): Promise<HNStory[]> {
  try {
    const response = await fetch(
      `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=${limit}`
    );

    if (!response.ok) {
      throw new Error(`HN API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.hits.map((hit: any) => ({
      objectID: hit.objectID,
      title: hit.title || '',
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      author: hit.author,
      points: hit.points || 0,
      num_comments: hit.num_comments || 0,
      created_at: hit.created_at,
      created_at_i: hit.created_at_i,
      story_text: hit.story_text || null,
    }));
  } catch (error) {
    console.error('HN front page fetch error:', error);
    throw new Error(`Failed to fetch HN front page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for recent stories (last 24 hours) with minimum engagement
 */
export async function searchRecentStories(
  keyword: string,
  minPoints: number = 10,
  minComments: number = 5
): Promise<HNStory[]> {
  const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

  try {
    const result = await searchHackerNews(keyword, {
      tags: 'story',
      numericFilters: `created_at_i>${oneDayAgo},points>${minPoints},num_comments>${minComments}`,
      hitsPerPage: 50,
    });

    return result.hits;
  } catch (error) {
    console.error('HN recent stories search error:', error);
    throw new Error(`Failed to search recent HN stories: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
