-- Create a function to get published articles with tags for the feed
-- This bypasses RLS on the tags table for public access

create or replace function public.get_published_articles_feed(
  p_search text default null,
  p_offset int default 0,
  p_limit int default 10
)
returns table (
  id uuid,
  title text,
  published_at timestamptz,
  updated_at timestamptz,
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
    a.published_at,
    a.updated_at,
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
  where a.status = 'published'
    and (
      p_search is null
      or p_search = ''
      or a.title ilike '%' || p_search || '%'
      or a.body_md ilike '%' || p_search || '%'
    )
  order by a.published_at desc nulls last
  offset p_offset
  limit p_limit;
$$;

-- Grant execute permissions
grant execute on function public.get_published_articles_feed(text, int, int) to anon, authenticated;
