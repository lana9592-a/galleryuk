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

export async function fetchHtmlPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'GalleryUKBot/1.0 (+https://galleryuk.vercel.app)',
      Accept: 'text/html,application/xhtml+xml',
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
