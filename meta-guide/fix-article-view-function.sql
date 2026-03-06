-- Quick fix: Update the get_published_article_with_author function
-- to include anonymous articles
-- Run this if articles aren't showing when clicked from the feed

DROP FUNCTION IF EXISTS public.get_published_article_with_author(uuid);

CREATE FUNCTION public.get_published_article_with_author(p_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  body_md text,
  published_at timestamptz,
  anonymous_at timestamptz,
  updated_at timestamptz,
  status text,
  author_name text,
  tags jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id,
    a.title,
    a.body_md,
    a.published_at,
    a.anonymous_at,
    a.updated_at,
    a.status,
    CASE
      WHEN a.status = 'anonymous' THEN 'Anonymous'
      ELSE COALESCE(
        u.raw_user_meta_data->>'display_name',
        u.email,
        'Anonymous'
      )
    END as author_name,
    COALESCE(
      (
        SELECT jsonb_agg(t.name)
        FROM public.article_tags at
        JOIN public.tags t ON t.id = at.tag_id
        WHERE at.article_id = a.id
      ),
      '[]'::jsonb
    ) as tags
  FROM public.articles a
  JOIN auth.users u ON u.id = a.writer_id
  WHERE a.id = p_id
    AND a.status IN ('published', 'anonymous')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_article_with_author(uuid) TO anon, authenticated;
