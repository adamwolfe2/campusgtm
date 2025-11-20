/**
 * Reddit API Service
 * Uses Reddit's JSON API (no auth required for read-only)
 * Rate limit: 60 requests per minute
 */

export interface RedditPost {
  id: string;
  title: string;
  selftext: string; // Post body
  author: string;
  subreddit: string;
  url: string;
  permalink: string;
  score: number; // Upvotes - downvotes
  num_comments: number;
  created_utc: number;
  is_self: boolean; // Text post vs link
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  permalink: string;
}

export interface RedditSearchResult {
  posts: RedditPost[];
  after: string | null; // Pagination cursor
}

/**
 * Search Reddit for posts containing a keyword
 */
export async function searchReddit(
  keyword: string,
  options: {
    subreddit?: string;
    sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
    time?: 'all' | 'year' | 'month' | 'week' | 'day' | 'hour';
    limit?: number;
  } = {}
): Promise<RedditSearchResult> {
  try {
    const { subreddit, sort = 'relevance', time = 'week', limit = 25 } = options;

    const baseUrl = subreddit
      ? `https://www.reddit.com/r/${subreddit}/search.json`
      : 'https://www.reddit.com/search.json';

    const params = new URLSearchParams({
      q: keyword,
      sort,
      t: time,
      limit: limit.toString(),
      restrict_sr: subreddit ? 'true' : 'false',
      raw_json: '1',
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'User-Agent': 'CampusGTM/1.0 (Market Research Tool)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const children = data.data?.children || [];

    const posts: RedditPost[] = children
      .filter((child: any) => child.kind === 't3') // t3 = post
      .map((child: any) => {
        const post = child.data;
        return {
          id: post.id,
          title: post.title,
          selftext: post.selftext || '',
          author: post.author,
          subreddit: post.subreddit,
          url: `https://reddit.com${post.permalink}`,
          permalink: post.permalink,
          score: post.score,
          num_comments: post.num_comments,
          created_utc: post.created_utc,
          is_self: post.is_self,
        };
      });

    return {
      posts,
      after: data.data?.after || null,
    };
  } catch (error) {
    console.error('Reddit search error:', error);
    throw new Error(`Failed to search Reddit: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get posts from a specific subreddit
 */
export async function getSubredditPosts(
  subreddit: string,
  sort: 'hot' | 'new' | 'top' | 'rising' = 'hot',
  limit: number = 25
): Promise<RedditPost[]> {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`,
      {
        headers: {
          'User-Agent': 'CampusGTM/1.0 (Market Research Tool)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const children = data.data?.children || [];

    return children
      .filter((child: any) => child.kind === 't3')
      .map((child: any) => {
        const post = child.data;
        return {
          id: post.id,
          title: post.title,
          selftext: post.selftext || '',
          author: post.author,
          subreddit: post.subreddit,
          url: `https://reddit.com${post.permalink}`,
          permalink: post.permalink,
          score: post.score,
          num_comments: post.num_comments,
          created_utc: post.created_utc,
          is_self: post.is_self,
        };
      });
  } catch (error) {
    console.error('Subreddit fetch error:', error);
    throw new Error(`Failed to fetch subreddit: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for subreddits by keyword
 */
export async function searchSubreddits(keyword: string, limit: number = 10): Promise<{
  name: string;
  display_name: string;
  title: string;
  description: string;
  subscribers: number;
  url: string;
  public_description: string;
}[]> {
  try {
    const response = await fetch(
      `https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(keyword)}&limit=${limit}&raw_json=1`,
      {
        headers: {
          'User-Agent': 'CampusGTM/1.0 (Market Research Tool)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const children = data.data?.children || [];

    return children
      .filter((child: any) => child.kind === 't5') // t5 = subreddit
      .map((child: any) => {
        const sub = child.data;
        return {
          name: sub.name,
          display_name: sub.display_name,
          title: sub.title,
          description: sub.description || '',
          subscribers: sub.subscribers || 0,
          url: `https://reddit.com/r/${sub.display_name}`,
          public_description: sub.public_description || '',
        };
      });
  } catch (error) {
    console.error('Subreddit search error:', error);
    throw new Error(`Failed to search subreddits: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
