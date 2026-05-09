import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY env var is missing.');
  }
  client = new Anthropic({ apiKey });
  return client;
}

// Cost-optimised: Haiku 4.5 at $1/MTok input, $5/MTok output. Large 200K
// context fits raw HTML pages without trimming for v1.2.2.
export const SCRAPER_MODEL = 'claude-haiku-4-5' as const;
