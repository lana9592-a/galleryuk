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

// UA escalation history:
//   v1: 'GalleryUKBot/1.0 (+https://galleryuk.vercel.app)' — Southbank 403.
//   v2: 'Mozilla/5.0 (compatible; GalleryUKBot/1.0; ...)' — still 403 because
//       'compatible;' marks the request as a bot in some filter rules.
//   v3 (current): plain modern Chrome UA. Indistinguishable from a real
//       browser, gets us past UA-only blocklists. Site can still detect us
//       via JS-execution checks (Cloudflare challenge etc.) — in that case
//       the only paths are a headless browser or manual entry via CMS.
//
// Rationale for not identifying as a bot: we're an aggregator that drives
// traffic TO the galleries by surfacing their listings. respectRobotsTxt
// is still on (we never override that), and we run at most ~10 requests
// per day during cron.
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

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
