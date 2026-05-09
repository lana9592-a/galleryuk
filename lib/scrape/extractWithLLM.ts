import 'server-only';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
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

  const response = await anthropic.messages.parse({
    model: SCRAPER_MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Page URL: ${pageUrl}\n\nHTML:\n\n${html.slice(0, 240_000)}`,
      },
    ],
    output_config: { format: zodOutputFormat(ScrapedResponseSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error('LLM returned a response that did not match the schema.');
  }

  return {
    exhibitions: parsed.exhibitions,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
