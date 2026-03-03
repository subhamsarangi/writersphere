-- Updated function to include tags in the article response
-- This allows public users to see tags without needing RLS permissions on the tags table

-- First, drop the existing function
drop function if exists public.get_published_article_with_author(uuid);

-- Then create the new version with tags
create or replace function public.get_published_article_with_author(p_id uuid)
returns table (
  id uuid,
  title text,
  body_md text,
  published_at timestamptz,
  updated_at timestamptz,
  author_name text,
  tags jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    a.title,
    a.body_md,
    a.published_at,
    a.updated_at,
    coalesce(
      u.raw_user_meta_data->>'display_name',
      u.email,
      'Anonymous'
    ) as author_name,
    coalesce(
      (
        select jsonb_agg(t.name)
        from public.article_tags at
        join public.tags t on t.id = at.tag_id
        where at.article_id = a.id
      ),
      '[]'::jsonb
    ) as tags
  from public.articles a
  join auth.users u on u.id = a.writer_id
  where a.id = p_id
    and a.status = 'published'
  limit 1;
$$;

grant execute on function public.get_published_article_with_author(uuid) to anon, authenticated;
