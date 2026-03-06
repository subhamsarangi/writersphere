-- Migration: Add anonymous status support
-- This adds the ability to publish articles anonymously

-- 1. Add the anonymous_at timestamp column
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS anonymous_at timestamptz NULL;

-- 2. Update the status check constraint to include 'anonymous'
-- First, drop the existing constraint
ALTER TABLE public.articles
DROP CONSTRAINT IF EXISTS articles_status_check;

-- Then, add the updated constraint
ALTER TABLE public.articles
ADD CONSTRAINT articles_status_check
CHECK (status IN ('draft', 'published', 'anonymous', 'unpublished', 'archived', 'deleted'));

-- 3. Update the trigger function to enforce min tags for anonymous status
CREATE OR REPLACE FUNCTION public.enforce_min_tags_for_non_draft()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  tcount INT;
BEGIN
  IF (NEW.status IN ('published', 'anonymous', 'unpublished', 'archived')) THEN
    SELECT COUNT(*) INTO tcount
    FROM public.article_tags at
    WHERE at.article_id = NEW.id;

    IF tcount < 2 THEN
      RAISE EXCEPTION 'Need at least 2 tags to set status to % (have %).', NEW.status, tcount;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Update the RLS policy for selecting articles (if needed)
-- The existing policies should work, but you may want to update the public feed function
-- to handle anonymous articles differently

-- 5. Drop and recreate function to get published articles with conditional author display
-- (Required because we're changing the return type by adding new columns)
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
  author_name text
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
    END as author_name
  FROM public.articles a
  JOIN auth.users u ON u.id = a.writer_id
  WHERE a.id = p_id
    AND a.status IN ('published', 'anonymous')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_article_with_author(uuid) TO anon, authenticated;

-- 6. Drop and recreate the feed function to include anonymous articles
-- (This is the function used by the feed page)
DROP FUNCTION IF EXISTS public.get_published_articles_feed(text, int, int);

CREATE FUNCTION public.get_published_articles_feed(
  p_search text DEFAULT NULL,
  p_offset int DEFAULT 0,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
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
    COALESCE(a.published_at, a.anonymous_at) as published_at,
    a.updated_at,
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
  WHERE a.status IN ('published', 'anonymous')
    AND (
      p_search IS NULL
      OR p_search = ''
      OR a.title ILIKE '%' || p_search || '%'
      OR a.body_md ILIKE '%' || p_search || '%'
    )
  ORDER BY COALESCE(a.published_at, a.anonymous_at) DESC NULLS LAST
  OFFSET p_offset
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_articles_feed(text, int, int) TO anon, authenticated;

-- 7. Optional: Create a more detailed feed function with author names
DROP FUNCTION IF EXISTS public.get_feed_articles(INT, INT);

CREATE FUNCTION public.get_feed_articles(
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  body_md text,
  published_at timestamptz,
  anonymous_at timestamptz,
  updated_at timestamptz,
  status text,
  author_name text,
  category_name text
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
    c.name as category_name
  FROM public.articles a
  JOIN auth.users u ON u.id = a.writer_id
  LEFT JOIN public.categories c ON c.id = a.category_id
  WHERE a.status IN ('published', 'anonymous')
  ORDER BY COALESCE(a.published_at, a.anonymous_at) DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION public.get_feed_articles(INT, INT) TO anon, authenticated;
