import 'server-only';
import { getAnthropic, SCRAPER_MODEL } from './anthropic';
import { ScrapedResponseSchema, type ScrapedExhibition } from './types';

const SYSTEM_PROMPT = `You extract structured exhibition data from museum and gallery "What's on" page HTML.

Return only exhibitions that are currently on or upcoming at this venue.

Rules:
- Skip permanent collections, displays, and "always on" content.
- Skip past exhibitions and unconfirmed "coming soon" rows without dates.
- Use ISO 8601 (YYYY-MM-DD) for dates. "12 May 2026" → "2026-05-12".
- "summary" is the short blurb shown on the listing card; keep it ≤ 200 characters.
- "description" is the longer body. Plain markdown is fine.
- "category" must be one of: painting, photography, sculpture, installation, mixed. Use "mixed" when unsure.
- "priceFrom" / "priceTo" are GBP numbers, or null for free entry.
- "ticketUrl" — VERY IMPORTANT — the URL of THIS specific exhibition's own page on the gallery's website (where the visitor can read more, see times, and book if applicable). On a "What's on" listing, this is the link that wraps each exhibition's title/card — NOT the page URL itself, NOT the gallery's homepage, NOT a generic "buy tickets" header link. Resolve relative URLs (e.g. /whats-on/exhibition-foo) to absolute by combining with the page URL. Set null only when no exhibition-specific link exists at all.
- "heroImage" is the absolute URL of the main image for that exhibition. If only a relative URL is present, resolve it against the page URL. If no image is present, copy the page's largest related image URL.
- "heroImageAlt" is a short alt text describing the image (≤ 200 characters).
- "artists" / "tags" are arrays — use empty arrays, not null, when unknown.
- "curator" is null if not stated.

Output the JSON object that the schema demands. No prose, no commentary.`;

// Hand-written JSON Schema. Mirrors ScrapedResponseSchema in types.ts but
// avoids the @anthropic-ai/sdk zod helper, which currently expects Zod v4
// internals (a `.def` accessor) — our project uses Zod v3 (`._def`), so
// using the helper raises "Cannot read properties of undefined (reading 'def')".
const RESPONSE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['exhibitions'],
  properties: {
    exhibitions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'title',
          'summary',
          'description',
          'startDate',
          'endDate',
          'category',
          'priceFrom',
          'priceTo',
          'ticketUrl',
          'heroImage',
          'heroImageAlt',
          'artists',
          'curator',
          'tags',
        ],
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          description: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          category: {
            type: 'string',
            enum: ['painting', 'photography', 'sculpture', 'installation', 'mixed'],
          },
          priceFrom: { type: ['number', 'null'] },
          priceTo: { type: ['number', 'null'] },
          ticketUrl: { type: ['string', 'null'] },
          heroImage: { type: 'string' },
          heroImageAlt: { type: 'string' },
          artists: { type: 'array', items: { type: 'string' } },
          curator: { type: ['string', 'null'] },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
} as const;

export type ExtractResult = {
  exhibitions: ScrapedExhibition[];
  inputTokens: number;
  outputTokens: number;
};

export async function extractExhibitionsWithLLM(
  html: string,
  pageUrl: string,
): Promise<ExtractResult> {
  const anthropic = getAnthropic();

  const response = await anthropic.messages.create({
    model: SCRAPER_MODEL,
    // Output: gallery pages typically yield 10-30 exhibitions @ ~150 tokens
    // each. 4096 covers all observed cases with headroom; 8192 was budget
    // for failure modes that the strict schema now catches earlier.
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        // HTML cap: 100k chars (~25k tokens). After cleanHtml strips
        // scripts/styles/comments, real What's On pages run 30-80k chars
        // and fit easily. Hard ceiling protects against pathological
        // pages (one Tate index page measured at 220k post-clean) that
        // would otherwise quadruple the Anthropic bill per call.
        content: `Page URL: ${pageUrl}\n\nHTML:\n\n${html.slice(0, 100_000)}`,
      },
    ],
    output_config: {
      format: {
        type: 'json_schema',
        schema: RESPONSE_JSON_SCHEMA as unknown as Record<string, unknown>,
      },
    },
  });

  const textBlock = response.content.find(
    (b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text',
  );
  if (!textBlock) {
    throw new Error('LLM returned no text content.');
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(textBlock.text);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(
      `LLM response was not valid JSON: ${reason}. First 200 chars: ${textBlock.text.slice(0, 200)}`,
    );
  }

  const result = ScrapedResponseSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new Error(
      `LLM response did not match schema: ${result.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
    );
  }

  // Defence in depth — even with the prompt, the LLM occasionally returns a
  // relative URL ('/whats-on/foo') for ticketUrl or heroImage. Resolve them
  // against the page URL so they store as absolute and the public site's
  // <a href> works without JS-side rewriting. Drop anything we can't make
  // into a usable absolute URL; ticketUrl is nullable, heroImage stays as
  // whatever the LLM gave us (Zod check downstream catches bad heroImages).
  const exhibitions = result.data.exhibitions.map((e) => ({
    ...e,
    ticketUrl: toAbsoluteUrlOrNull(e.ticketUrl, pageUrl),
    heroImage: toAbsoluteUrl(e.heroImage, pageUrl) ?? e.heroImage,
  }));

  return {
    exhibitions,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

function toAbsoluteUrl(value: string, base: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed, base).toString();
  } catch {
    return null;
  }
}

function toAbsoluteUrlOrNull(
  value: string | null,
  base: string,
): string | null {
  if (value == null) return null;
  return toAbsoluteUrl(value, base);
}
