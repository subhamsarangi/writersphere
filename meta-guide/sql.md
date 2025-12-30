## 1) Database (Supabase / Postgres)

### Tables (articles + tags)

```sql
-- Articles (article/essay/note)
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  writer_id uuid not null references auth.users(id) on delete cascade,

  title text not null default 'Untitled',
  body_md text not null default '',
  status text not null default 'draft'
    check (status in ('draft','published','unpublished','archived','deleted')),

  category_id uuid null references public.categories(id) on delete set null,
  subcategory_id uuid null references public.subcategories(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_saved_at timestamptz null,

  published_at timestamptz null,
  unpublished_at timestamptz null,
  archived_at timestamptz null,
  deleted_at timestamptz null
);

-- Optional but recommended for case-insensitive tag uniqueness
create extension if not exists citext;

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  writer_id uuid not null references auth.users(id) on delete cascade,
  name citext not null,
  created_at timestamptz not null default now(),
  unique (writer_id, name)
);

create table if not exists public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id)
);
```

### Enforce “min 5 tags”

Postgres can’t do this with a plain CHECK across another table, so use a trigger:

```sql
create or replace function public.enforce_min_tags_for_non_draft()
returns trigger language plpgsql as $$
declare
  tcount int;
begin
  if (new.status in ('published','unpublished','archived')) then
    select count(*) into tcount
    from public.article_tags at
    where at.article_id = new.id;

    if tcount < 5 then
      raise exception 'Need at least 5 tags to set status to % (have %).', new.status, tcount;
    end if;
  end if;

  return new;
end;
$$;


drop trigger if exists trg_enforce_min_tags on public.articles;

create trigger trg_enforce_min_tags
after insert or update of status on public.articles
for each row
execute function public.enforce_min_tags_for_non_draft();
```

### RLS (writer-owned rows)

```sql
alter table public.articles enable row level security;
alter table public.tags enable row level security;
alter table public.article_tags enable row level security;

-- Articles: writer can CRUD their own
create policy "articles_select_own"
on public.articles for select
using (writer_id = auth.uid());

create policy "articles_insert_own"
on public.articles for insert
with check (writer_id = auth.uid());

create policy "articles_update_own"
on public.articles for update
using (writer_id = auth.uid())
with check (writer_id = auth.uid());

create policy "articles_delete_own"
on public.articles for delete
using (writer_id = auth.uid());

-- Tags: writer can CRUD their own tags
create policy "tags_select_own"
on public.tags for select
using (writer_id = auth.uid());

create policy "tags_insert_own"
on public.tags for insert
with check (writer_id = auth.uid());

create policy "tags_update_own"
on public.tags for update
using (writer_id = auth.uid())
with check (writer_id = auth.uid());

create policy "tags_delete_own"
on public.tags for delete
using (writer_id = auth.uid());

-- Join table: allowed if the linked article belongs to the writer
create policy "article_tags_select_own"
on public.article_tags for select
using (
  exists (
    select 1 from public.articles a
    where a.id = article_tags.article_id
      and a.writer_id = auth.uid()
  )
);

create policy "article_tags_insert_own"
on public.article_tags for insert
with check (
  exists (
    select 1 from public.articles a
    where a.id = article_tags.article_id
      and a.writer_id = auth.uid()
  )
);

create policy "article_tags_delete_own"
on public.article_tags for delete
using (
  exists (
    select 1 from public.articles a
    where a.id = article_tags.article_id
      and a.writer_id = auth.uid()
  )
);
```
