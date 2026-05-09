import { z } from 'zod';

// Loose schema for what the LLM returns. Looser than ExhibitionSchema —
// it permits empty arrays, nullable optionals, and out-of-range prices that
// our app schema would reject. Each row is re-parsed strictly later before
// it lands in the DB.
//
// Structured-outputs compatibility: keep the schema simple — no recursion,
// no min/max numerics, no string length constraints. The TS SDK strips
// unsupported keywords automatically, but plainer schemas extract more
// reliably.

export const ScrapedExhibitionSchema = z.object({
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  category: z.enum(['painting', 'photography', 'sculpture', 'installation', 'mixed']),
  priceFrom: z.number().nullable(),
  priceTo: z.number().nullable(),
  ticketUrl: z.string().nullable(),
  heroImage: z.string(),
  heroImageAlt: z.string(),
  artists: z.array(z.string()),
  curator: z.string().nullable(),
  tags: z.array(z.string()),
});

export type ScrapedExhibition = z.infer<typeof ScrapedExhibitionSchema>;

export const ScrapedResponseSchema = z.object({
  exhibitions: z.array(ScrapedExhibitionSchema),
});

export type ScrapedResponse = z.infer<typeof ScrapedResponseSchema>;
