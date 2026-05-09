-- v1.2.1: data automation infrastructure
-- Adds scrape provenance + protection columns and creates scrape_log table.
--
-- Run in Supabase SQL Editor.
-- Idempotent: safe to re-run.

-- ============== 1. galleries: where to scrape ==============

alter table public.galleries
  add column if not exists whats_on_url text;

comment on column public.galleries.whats_on_url is
  'Gallery''s public "What''s on" listing page. Scraped daily for new exhibitions. NULL = skip this gallery.';

-- ============== 2. exhibitions: scrape provenance ==============

alter table public.exhibitions
  add column if not exists source_url text,
  add column if not exists last_scraped_at timestamptz,
  add column if not exists verified boolean not null default false;

comment on column public.exhibitions.source_url is
  'URL where this exhibition was found. Set by scraper, may be edited manually.';

comment on column public.exhibitions.last_scraped_at is
  'Last time the scraper touched this row. NULL = manually created.';

comment on column public.exhibitions.verified is
  'TRUE = admin reviewed/edited via CMS. Scraper will not overwrite verified rows.';

create index if not exists exhibitions_verified_idx
  on public.exhibitions (verified);

-- ============== 3. scrape_log: per-run telemetry ==============

create table if not exists public.scrape_log (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz not null default now(),
  gallery_id text references public.galleries(id) on delete set null,
  status text not null check (status in ('success', 'error', 'skipped')),
  exhibitions_found int not null default 0,
  exhibitions_inserted int not null default 0,
  exhibitions_updated int not null default 0,
  exhibitions_skipped int not null default 0,
  error_message text,
  duration_ms int,
  prompt_tokens int,
  completion_tokens int
);

comment on table public.scrape_log is
  'One row per gallery per cron run. Lets the admin UI show pass/fail history and cost.';

create index if not exists scrape_log_run_at_idx
  on public.scrape_log (run_at desc);

create index if not exists scrape_log_gallery_run_idx
  on public.scrape_log (gallery_id, run_at desc);

-- ============== 4. RLS for scrape_log ==============
-- Public/anon must NOT read scrape_log. Service role bypasses RLS so the
-- scraper writes fine. Admin reads happen via service-role client too.

alter table public.scrape_log enable row level security;

-- (Intentionally no policies for anon/authenticated — they can't read the log.
--  service_role bypasses RLS, so admin server pages still see it.)
