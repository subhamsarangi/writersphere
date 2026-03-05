-- Create writing_sessions table to track writer activity
create table if not exists public.writing_sessions (
  id uuid primary key default gen_random_uuid(),
  writer_id uuid references auth.users(id) on delete cascade not null,
  article_id uuid references public.articles(id) on delete cascade,
  session_date date not null default current_date,
  
  -- Time tracking (in seconds)
  active_time integer default 0, -- Time when tab was active
  typing_time integer default 0, -- Time spent typing
  editing_time integer default 0, -- Time spent editing (backspace, delete)
  
  -- Activity counts
  characters_added integer default 0,
  characters_deleted integer default 0,
  paste_count integer default 0,
  
  -- Session metadata
  started_at timestamptz default now(),
  last_activity_at timestamptz default now(),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_writing_sessions_writer_date 
  on public.writing_sessions(writer_id, session_date desc);

create index if not exists idx_writing_sessions_article 
  on public.writing_sessions(article_id);

-- Enable RLS
alter table public.writing_sessions enable row level security;

-- Policy: Writers can only see their own sessions
create policy "Writers can view own sessions"
  on public.writing_sessions
  for select
  using (auth.uid() = writer_id);

-- Policy: Writers can insert their own sessions
create policy "Writers can insert own sessions"
  on public.writing_sessions
  for insert
  with check (auth.uid() = writer_id);

-- Policy: Writers can update their own sessions
create policy "Writers can update own sessions"
  on public.writing_sessions
  for update
  using (auth.uid() = writer_id);

-- Function to get writing stats for a date range
create or replace function public.get_writing_stats(
  p_writer_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  total_active_time bigint,
  total_typing_time bigint,
  total_editing_time bigint,
  total_characters_added bigint,
  total_characters_deleted bigint,
  total_paste_count bigint,
  session_count bigint,
  days_active bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sum(active_time), 0)::bigint as total_active_time,
    coalesce(sum(typing_time), 0)::bigint as total_typing_time,
    coalesce(sum(editing_time), 0)::bigint as total_editing_time,
    coalesce(sum(characters_added), 0)::bigint as total_characters_added,
    coalesce(sum(characters_deleted), 0)::bigint as total_characters_deleted,
    coalesce(sum(paste_count), 0)::bigint as total_paste_count,
    count(*)::bigint as session_count,
    count(distinct session_date)::bigint as days_active
  from public.writing_sessions
  where writer_id = p_writer_id
    and session_date >= p_start_date
    and session_date <= p_end_date;
$$;

-- Function to get daily writing stats for charts
create or replace function public.get_daily_writing_stats(
  p_writer_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  session_date date,
  active_time integer,
  typing_time integer,
  characters_added integer,
  characters_deleted integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    session_date,
    sum(active_time)::integer as active_time,
    sum(typing_time)::integer as typing_time,
    sum(characters_added)::integer as characters_added,
    sum(characters_deleted)::integer as characters_deleted
  from public.writing_sessions
  where writer_id = p_writer_id
    and session_date >= p_start_date
    and session_date <= p_end_date
  group by session_date
  order by session_date;
$$;

-- Grant execute permissions
grant execute on function public.get_writing_stats(uuid, date, date) to authenticated;
grant execute on function public.get_daily_writing_stats(uuid, date, date) to authenticated;
