-- Update article view function to include primary_image_url and category_name

DROP FUNCTION IF EXISTS public.get_published_article_with_author(uuid);

CREATE FUNCTION public.get_published_article_with_author(p_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  body_md text,
  primary_image_url text,
  category_name text,
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
    a.primary_image_url,
    c.name as category_name,
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
  LEFT JOIN public.categories c ON c.id = a.category_id
  WHERE a.id = p_id
    AND a.status IN ('published', 'anonymous')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_article_with_author(uuid) TO anon, authenticated;
