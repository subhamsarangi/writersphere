# Anonymous Status Migration Guide

This guide explains how to add anonymous publishing support to your Supabase database.

## What's New

The anonymous status allows users to publish articles without revealing their identity. Users can later reveal their identity by changing the status from "anonymous" to "published".

## Database Changes

1. **New Column**: `anonymous_at` (timestamptz) - tracks when an article was published anonymously
2. **Updated Status Constraint**: Adds "anonymous" to the allowed status values
3. **Updated Trigger**: Enforces minimum 2 tags for anonymous articles (same as published)
4. **Updated Functions**: Modified RPC functions to hide author identity for anonymous articles

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `meta-guide/migration-add-anonymous-status.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

**Note**: The migration will drop and recreate existing functions (`get_published_article_with_author` and `get_published_articles_feed`) because we're adding new columns to their return types. This is safe and won't affect your data.

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

Or run the migration directly:

```bash
psql $DATABASE_URL -f meta-guide/migration-add-anonymous-status.sql
```

## Verification

After running the migration, verify the changes:

```sql
-- Check if the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' AND column_name = 'anonymous_at';

-- Check the status constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'articles_status_check';

-- Test the trigger (should fail with less than 2 tags)
-- This is just to verify the trigger works
```

## Frontend Changes Already Applied

The following frontend components have been updated to support anonymous status:

- ✅ `types.ts` - Added "anonymous" to ArticleStatus type
- ✅ `utils.ts` - Added status label, metadata requirements, and transition messages
- ✅ `ArticleEditorHeader.tsx` - Added anonymous option with purple user icon
- ✅ `ArticleEditor.tsx` - Added anonymousAt state and database field handling

## How It Works

1. **Publishing Anonymously**: User selects "Anonymous" from the status dropdown
   - Requires category and minimum 2 tags (same as regular publish)
   - Sets `status = 'anonymous'` and `anonymous_at = now()`
   - Author name displays as "Anonymous" in public views

2. **Revealing Identity**: User changes status from "Anonymous" to "Published"
   - Confirmation modal explains the action
   - Sets `status = 'published'` and `published_at = now()`
   - Author name now displays normally

3. **Public Feed**: Both "published" and "anonymous" articles appear in feeds
   - Anonymous articles show "Anonymous" as the author
   - Published articles show the actual author name

## Database Functions

The migration includes two helper functions:

### `get_published_article_with_author(uuid)`
Returns a single article with conditional author display based on status.

### `get_feed_articles(limit, offset)`
Returns a paginated list of public articles (both published and anonymous) with proper author handling.

## Notes

- Anonymous articles are still owned by the writer in the database
- Writers can see their own anonymous articles in their dashboard
- Only the public display hides the author identity
- Changing from anonymous to published is a one-way operation (no confirmation to go back)
- All existing RLS policies continue to work as expected

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove the anonymous_at column
ALTER TABLE public.articles DROP COLUMN IF EXISTS anonymous_at;

-- Restore original status constraint
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_status_check
CHECK (status IN ('draft', 'published', 'unpublished', 'archived', 'deleted'));

-- Restore original trigger function
CREATE OR REPLACE FUNCTION public.enforce_min_tags_for_non_draft()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  tcount INT;
BEGIN
  IF (NEW.status IN ('published', 'unpublished', 'archived')) THEN
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

-- Restore original feed function
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
    ) as tags
  FROM public.articles a
  WHERE a.status = 'published'
    AND (
      p_search IS NULL
      OR p_search = ''
      OR a.title ILIKE '%' || p_search || '%'
      OR a.body_md ILIKE '%' || p_search || '%'
    )
  ORDER BY a.published_at DESC NULLS LAST
  OFFSET p_offset
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_articles_feed(text, int, int) TO anon, authenticated;

-- Restore original article function
DROP FUNCTION IF EXISTS public.get_published_article_with_author(uuid);

CREATE FUNCTION public.get_published_article_with_author(p_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  body_md text,
  published_at timestamptz,
  updated_at timestamptz,
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
    a.updated_at,
    COALESCE(
      u.raw_user_meta_data->>'display_name',
      u.email,
      'Anonymous'
    ) as author_name
  FROM public.articles a
  JOIN auth.users u ON u.id = a.writer_id
  WHERE a.id = p_id
    AND a.status = 'published'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_article_with_author(uuid) TO anon, authenticated;
```

## Troubleshooting

### Error: "cannot change return type of existing function"
**Solution**: The migration now includes `DROP FUNCTION` statements before recreating functions. If you still see this error, manually drop the functions first:
```sql
DROP FUNCTION IF EXISTS public.get_published_article_with_author(uuid);
DROP FUNCTION IF EXISTS public.get_published_articles_feed(text, int, int);
DROP FUNCTION IF EXISTS public.get_feed_articles(INT, INT);
```

### Error: "constraint already exists"
**Solution**: The migration includes `IF EXISTS` checks. If you still see this error, drop the constraint first:
```sql
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_status_check;
```

### Error: "column already exists"
**Solution**: The migration includes `IF NOT EXISTS` checks. If the column exists but wasn't properly configured, drop it first:
```sql
ALTER TABLE public.articles DROP COLUMN IF EXISTS anonymous_at;
```

### Frontend shows "Anonymous" but I want to see the author
**Issue**: You're viewing an article with `status = 'anonymous'`
**Solution**: This is expected behavior. Change the article status to "published" to reveal the author.
