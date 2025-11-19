'use server';

/**
 * Fetches the favicon for a given company URL
 * Tries multiple common favicon locations
 */
export async function fetchCompanyFavicon(companyUrl: string): Promise<string | null> {
  if (!companyUrl) {
    return null;
  }

  try {
    // Normalize URL
    let url = companyUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

    // Try multiple favicon locations in order of preference
    const faviconPaths = [
      '/favicon.ico',
      '/favicon.png',
      '/apple-touch-icon.png',
      '/apple-touch-icon-precomposed.png',
    ];

    // Try each path
    for (const path of faviconPaths) {
      const faviconUrl = `${baseUrl}${path}`;

      try {
        const response = await fetch(faviconUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });

        if (response.ok) {
          console.log(`[fetchCompanyFavicon] Found favicon at: ${faviconUrl}`);
          return faviconUrl;
        }
      } catch (err) {
        // Continue to next path
        continue;
      }
    }

    // Try Google's favicon service as fallback
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    console.log(`[fetchCompanyFavicon] Using Google favicon service for: ${urlObj.hostname}`);
    return googleFaviconUrl;

  } catch (error) {
    console.error('[fetchCompanyFavicon] Error fetching favicon:', error);
    return null;
  }
}
