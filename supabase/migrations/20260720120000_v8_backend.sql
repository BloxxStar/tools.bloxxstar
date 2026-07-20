create extension if not exists pgcrypto;

create type public.content_status as enum ('draft','review','published','archived');
create type public.eol_status as enum ('active','announced','expected','eol','unknown');
create type public.eol_precision as enum ('day','month','quarter','year','unknown');
create type public.source_kind as enum ('manufacturer','retailer','marketplace','editorial','community','other');
create type public.watchdog_status as enum ('open','accepted','rejected','deferred');

create table public.manufacturers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null unique,
  country_code char(2),
  founded_year integer,
  website_url text,
  logo_url text,
  description text,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sets (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid not null references public.manufacturers(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  set_number text not null,
  name text not null,
  edition text,
  ean text,
  category text,
  subcategory text,
  theme text,
  country_code char(2),
  scale text,
  parts_count integer check (parts_count is null or parts_count >= 0),
  minifigures_count integer check (minifigures_count is null or minifigures_count >= 0),
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  length_mm integer check (length_mm is null or length_mm >= 0),
  width_mm integer check (width_mm is null or width_mm >= 0),
  height_mm integer check (height_mm is null or height_mm >= 0),
  msrp numeric(10,2) check (msrp is null or msrp >= 0),
  currency char(3) default 'EUR',
  release_date date,
  eol_status public.eol_status not null default 'unknown',
  eol_date date,
  eol_precision public.eol_precision not null default 'unknown',
  eol_confirmed boolean not null default false,
  eol_checked_at timestamptz,
  eol_note text,
  product_url text,
  hero_image_url text,
  youtube_url text,
  historical_article text,
  bloxxstar_rating numeric(2,1) check (bloxxstar_rating is null or bloxxstar_rating between 0 and 5),
  tags text[] not null default '{}',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manufacturer_id, set_number)
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind public.source_kind not null default 'other',
  base_url text,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.set_sources (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.sets(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete restrict,
  field_name text not null,
  source_url text,
  source_value jsonb,
  checked_at timestamptz not null default now(),
  is_official boolean not null default false,
  notes text,
  unique (set_id, source_id, field_name, source_url)
);

create table public.watchdog_findings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  set_id uuid references public.sets(id) on delete cascade,
  external_key text,
  field_name text not null,
  old_value jsonb,
  proposed_value jsonb,
  evidence_url text,
  confidence numeric(4,3) check (confidence is null or confidence between 0 and 1),
  status public.watchdog_status not null default 'open',
  detected_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  review_note text
);

create index sets_search_idx on public.sets using gin (
  to_tsvector('simple', coalesce(set_number,'') || ' ' || coalesce(name,'') || ' ' || coalesce(category,'') || ' ' || coalesce(theme,'') || ' ' || array_to_string(tags,' '))
);
create index sets_eol_idx on public.sets (eol_status, eol_date);
create index sets_status_idx on public.sets (status, manufacturer_id);
create index watchdog_open_idx on public.watchdog_findings (status, detected_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger manufacturers_updated_at before update on public.manufacturers
for each row execute function public.set_updated_at();
create trigger sets_updated_at before update on public.sets
for each row execute function public.set_updated_at();
create trigger sources_updated_at before update on public.sources
for each row execute function public.set_updated_at();

create or replace function public.is_bloxxstar_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','editor','reviewer'), false);
$$;

alter table public.manufacturers enable row level security;
alter table public.sets enable row level security;
alter table public.sources enable row level security;
alter table public.set_sources enable row level security;
alter table public.watchdog_findings enable row level security;

create policy "published manufacturers are public" on public.manufacturers
for select using (status = 'published' or public.is_bloxxstar_editor());
create policy "published sets are public" on public.sets
for select using (status = 'published' or public.is_bloxxstar_editor());
create policy "editors manage manufacturers" on public.manufacturers
for all to authenticated using (public.is_bloxxstar_editor()) with check (public.is_bloxxstar_editor());
create policy "editors manage sets" on public.sets
for all to authenticated using (public.is_bloxxstar_editor()) with check (public.is_bloxxstar_editor());
create policy "editors manage sources" on public.sources
for all to authenticated using (public.is_bloxxstar_editor()) with check (public.is_bloxxstar_editor());
create policy "editors manage set sources" on public.set_sources
for all to authenticated using (public.is_bloxxstar_editor()) with check (public.is_bloxxstar_editor());
create policy "editors manage watchdog findings" on public.watchdog_findings
for all to authenticated using (public.is_bloxxstar_editor()) with check (public.is_bloxxstar_editor());

grant usage on schema public to anon, authenticated;
grant select on public.manufacturers, public.sets to anon;
grant select, insert, update, delete on public.manufacturers, public.sets, public.sources, public.set_sources, public.watchdog_findings to authenticated;

grant execute on function public.is_bloxxstar_editor() to anon, authenticated;

create or replace view public.eol_overview as
select
  s.id,
  s.slug,
  s.set_number,
  s.name,
  m.name as manufacturer,
  s.eol_status,
  s.eol_date,
  s.eol_precision,
  s.eol_confirmed,
  s.eol_checked_at,
  case
    when s.eol_status = 'eol' then 'past'
    when s.eol_date is not null and s.eol_date <= current_date + interval '30 days' then 'next_30_days'
    when s.eol_date is not null and s.eol_date <= current_date + interval '90 days' then 'next_90_days'
    when s.eol_status = 'unknown' then 'unknown'
    else 'later'
  end as eol_bucket
from public.sets s
join public.manufacturers m on m.id = s.manufacturer_id
where s.status = 'published';

grant select on public.eol_overview to anon, authenticated;
