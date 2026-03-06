-- Update feed function to include primary_image_url and anonymous articles

DROP FUNCTION IF EXISTS public.get_published_articles_feed(text, int, int);

CREATE OR REPLACE FUNCTION public.get_published_articles_feed(
  p_search text DEFAULT NULL,
  p_offset int DEFAULT 0,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  primary_image_url text,
  published_at timestamptz,
  updated_at timestamptz,
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
    a.primary_image_url,
    a.published_at,
    a.updated_at,
    COALESCE(
      (
        SELECT jsonb_agg(t.name)
        FROM public.article_tags at
        JOIN public.tags t ON t.id = at.tag_id
        WHERE at.article_id = a.id
      ),
      '[]'::jsonb
    ) AS tags
  FROM public.articles a
  WHERE a.status IN ('published', 'anonymous')
    AND (
      p_search IS NULL
      OR p_search = ''
      OR a.title ILIKE '%' || p_search || '%'
      OR a.body_md ILIKE '%' || p_search || '%'
    )
  ORDER BY a.published_at DESC NULLS LAST, a.anonymous_at DESC NULLS LAST
  OFFSET p_offset
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_articles_feed(text, int, int) TO anon, authenticated;
