-- ============================================================
-- TAMKEEN — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------
-- USERS (mirrors Supabase auth.users)
-- -------------------------------------------------------
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  invite_code text,
  fcm_token   text,
  is_admin    boolean default false,
  lang_pref   text default 'en',
  created_at  timestamptz default now()
);

alter table public.users enable row level security;
create policy "Users can read/update own profile" on public.users
  for all using (auth.uid() = id);
create policy "Admins can read all users" on public.users
  for select using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- -------------------------------------------------------
-- INVITE CODES
-- -------------------------------------------------------
create table public.invite_codes (
  id         uuid primary key default uuid_generate_v4(),
  code       text unique not null,
  created_by uuid references public.users(id),
  used_by    uuid references public.users(id),
  is_used    boolean default false,
  used_at    timestamptz,
  created_at timestamptz default now()
);

alter table public.invite_codes enable row level security;
-- Anyone (unauthenticated) can check a code to register
create policy "Anyone can validate invite codes" on public.invite_codes
  for select using (true);
-- Only admins can insert or update codes
create policy "Admins manage invite codes" on public.invite_codes
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );
-- Allow update during registration (mark as used)
create policy "Allow marking code used" on public.invite_codes
  for update using (true);

-- -------------------------------------------------------
-- WAJIBAAT LOGS (one row per user per day)
-- -------------------------------------------------------
create table public.wajibaat_logs (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  date                date not null,

  -- Salat (mosque/home/late/missed/pending)
  salat_fajr          text default 'pending',
  salat_dhuhr         text default 'pending',
  salat_asr           text default 'pending',
  salat_maghrib       text default 'pending',
  salat_isha          text default 'pending',

  -- Other wajibaat
  fasting             boolean default false,
  is_fast_day         boolean default false,
  fast_type           text,
  tahajjud            boolean default false,
  adhkar_morning      boolean default false,
  adhkar_evening      boolean default false,
  salat_duha          boolean default false,
  quran_juz           integer,
  quran_pages         integer default 0,
  tawbah_before_subhi boolean default false,
  tawbah_after_isha   boolean default false,
  sadaqah             boolean default false,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),

  unique (user_id, date)
);

alter table public.wajibaat_logs enable row level security;
create policy "Users can manage own logs" on public.wajibaat_logs
  for all using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger wajibaat_logs_updated_at
  before update on public.wajibaat_logs
  for each row execute function update_updated_at();

-- -------------------------------------------------------
-- GOALS
-- -------------------------------------------------------
create table public.goals (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  category        text not null check (category in ('hereafter','financial','family','health','personal_dev')),
  goal_title      text not null,
  objective       text,
  timeline_start  date,
  timeline_end    date,
  status          text default 'not_started' check (status in ('not_started','in_progress','completed','abandoned')),
  ai_milestones   jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.goals enable row level security;
create policy "Users can manage own goals" on public.goals
  for all using (auth.uid() = user_id);

create trigger goals_updated_at
  before update on public.goals
  for each row execute function update_updated_at();

-- -------------------------------------------------------
-- KEY RESULTS
-- -------------------------------------------------------
create table public.key_results (
  id              uuid primary key default uuid_generate_v4(),
  goal_id         uuid not null references public.goals(id) on delete cascade,
  description     text not null,
  target_value    text,
  current_value   numeric default 0,
  unit            text,
  due_date        date,
  status          text default 'not_started' check (status in ('not_started','in_progress','completed')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.key_results enable row level security;
create policy "Users can manage own KRs" on public.key_results
  for all using (
    exists (select 1 from public.goals where id = key_results.goal_id and user_id = auth.uid())
  );

-- -------------------------------------------------------
-- WEEKLY REPORTS
-- -------------------------------------------------------
create table public.weekly_reports (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  week_start        date not null,
  wajibaat_summary  jsonb,
  goals_summary     jsonb,
  ai_message        text,
  created_at        timestamptz default now(),
  unique (user_id, week_start)
);

alter table public.weekly_reports enable row level security;
create policy "Users can manage own reports" on public.weekly_reports
  for all using (auth.uid() = user_id);

-- -------------------------------------------------------
-- SEED: Create admin user invite code
-- Run this after creating your first account
-- -------------------------------------------------------
-- insert into public.invite_codes (code, is_used, created_by)
-- values ('ADMIN1', false, null);

-- -------------------------------------------------------
-- SEED: Make yourself admin (replace with your user ID)
-- -------------------------------------------------------
-- update public.users set is_admin = true where email = 'durodoladuro55@gmail.com';
