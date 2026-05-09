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
- "ticketUrl" is the booking page URL, or null if none is shown.
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
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Page URL: ${pageUrl}\n\nHTML:\n\n${html.slice(0, 240_000)}`,
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

  return {
    exhibitions: result.data.exhibitions,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
