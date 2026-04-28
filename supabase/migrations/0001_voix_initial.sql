create extension if not exists "pgcrypto";

create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_monthly integer not null,
  price_yearly integer not null,
  max_testimonials integer not null,
  max_videos_monthly integer not null,
  max_widgets integer not null,
  features jsonb not null default '{}'::jsonb
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null,
  company_slug text not null unique,
  website_url text,
  logo_url text,
  plan_id text references public.plans(id),
  plan_status text not null default 'trial',
  trial_ends_at timestamptz,
  subscription_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  customer_name text not null,
  customer_email text,
  customer_title text,
  customer_avatar_url text,
  content text not null,
  video_url text,
  video_duration integer,
  transcript text,
  rating integer check (rating between 1 and 5),
  source text not null default 'manual',
  source_id text,
  status text not null default 'pending',
  tags text[] default '{}'::text[],
  widget_ids uuid[] default '{}'::uuid[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.widgets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null,
  config jsonb not null default '{}'::jsonb,
  filters jsonb default '{}'::jsonb,
  embed_code text,
  view_count integer not null default 0,
  click_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null,
  status text not null default 'draft',
  config jsonb not null default '{}'::jsonb,
  sent_count integer not null default 0,
  response_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  token text not null unique,
  customer_email text,
  customer_name text,
  used boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_testimonials_profile_status
  on public.testimonials(profile_id, status, created_at desc);

create index if not exists idx_widgets_profile
  on public.widgets(profile_id, created_at desc);

create index if not exists idx_campaigns_profile
  on public.campaigns(profile_id, created_at desc);

create index if not exists idx_activities_profile
  on public.activities(profile_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at
before update on public.testimonials
for each row
execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.testimonials enable row level security;
alter table public.widgets enable row level security;
alter table public.campaigns enable row level security;
alter table public.invites enable row level security;
alter table public.activities enable row level security;

create policy "profiles_owner_all"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "testimonials_owner_all"
on public.testimonials
for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "widgets_owner_all"
on public.widgets
for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "campaigns_owner_all"
on public.campaigns
for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "invites_owner_all"
on public.invites
for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "activities_owner_select"
on public.activities
for select
using (profile_id = auth.uid());

create policy "activities_owner_insert"
on public.activities
for insert
with check (profile_id = auth.uid());

insert into public.plans (
  id,
  name,
  price_monthly,
  price_yearly,
  max_testimonials,
  max_videos_monthly,
  max_widgets,
  features
) values
  (
    'starter',
    'Starter',
    3900,
    39000,
    100,
    10,
    1,
    '{"public_page": true, "imports": false, "analytics": false}'::jsonb
  ),
  (
    'growth',
    'Growth',
    7900,
    79000,
    -1,
    40,
    -1,
    '{"public_page": true, "imports": true, "analytics": true}'::jsonb
  ),
  (
    'scale',
    'Scale',
    15900,
    159000,
    -1,
    -1,
    -1,
    '{"public_page": true, "imports": true, "analytics": true, "api": true, "priority_support": true}'::jsonb
  )
on conflict (id) do update
set
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly,
  max_testimonials = excluded.max_testimonials,
  max_videos_monthly = excluded.max_videos_monthly,
  max_widgets = excluded.max_widgets,
  features = excluded.features;
