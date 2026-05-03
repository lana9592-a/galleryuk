-- v1.1 Phase B: GalleryUK schema
-- 갤러리 + 전시 테이블, 인덱스, RLS 읽기 정책
-- Run in Supabase SQL Editor (left sidebar > SQL Editor > New query).

-- ============== TABLES ==============

create table if not exists public.galleries (
  id text primary key,
  name text not null,
  short_name text,
  lat numeric(9,6) not null check (lat between 49 and 61),
  lng numeric(9,6) not null check (lng between -8 and 2),
  address text not null,
  city text not null default 'London',
  borough text,
  website text not null,
  logo_url text,
  opening_hours jsonb,
  description text,
  tags text[]
);

create table if not exists public.exhibitions (
  id text primary key,
  title text not null,
  gallery_id text not null references public.galleries(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  price_from numeric,
  price_to numeric,
  ticket_url text,
  category text not null check (category in ('painting','photography','sculpture','installation','mixed')),
  tags text[],
  summary text not null check (char_length(summary) <= 200),
  description text not null,
  artists text[],
  curator text,
  hero_image text not null,
  hero_image_alt text not null,
  images jsonb,
  featured boolean not null default false,
  check (start_date <= end_date)
);

-- ============== INDEXES ==============

create index if not exists exhibitions_gallery_id_idx
  on public.exhibitions (gallery_id);

create index if not exists exhibitions_dates_idx
  on public.exhibitions (start_date, end_date);

-- ============== RLS (Row Level Security) ==============
-- 익명 사용자도 읽기는 가능. 쓰기는 막힘 (정책 없음)

alter table public.galleries enable row level security;
alter table public.exhibitions enable row level security;

drop policy if exists "anon read galleries" on public.galleries;
create policy "anon read galleries"
  on public.galleries
  for select
  to anon, authenticated
  using (true);

drop policy if exists "anon read exhibitions" on public.exhibitions;
create policy "anon read exhibitions"
  on public.exhibitions
  for select
  to anon, authenticated
  using (true);
