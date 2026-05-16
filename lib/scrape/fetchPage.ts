import 'server-only';

// Strip <script>, <style>, comments, and collapse whitespace. Cheap and
// effective for big gallery pages — typically halves token count.
export function cleanHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// "Compatible-mode" UA: looks browser-shaped enough to clear most CDN
// bot filters (Southbank Centre's 403 on the bare 'GalleryUKBot/1.0'
// string is the motivating example), but identifies the project + URL
// per crawler-etiquette norms (same shape Googlebot/Bingbot use).
const USER_AGENT =
  'Mozilla/5.0 (compatible; GalleryUKBot/1.0; +https://galleryuk.vercel.app)';

export async function fetchHtmlPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-GB,en;q=0.9',
    },
    cache: 'no-store',
    // 30s ceiling — Anthropic call still has plenty of headroom under
    // Vercel's 60s function limit.
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Fetch ${url} failed: HTTP ${response.status}`);
  }
  const raw = await response.text();
  return cleanHtml(raw);
}
