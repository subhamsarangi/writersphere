-- Migration: Add main_image_url field to articles
-- This makes a main image mandatory for publishing articles

-- 1. Add the main_image_url column
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS main_image_url text NULL;

-- 2. Set a default placeholder image for existing published articles
-- Replace 'YOUR_PLACEHOLDER_IMAGE_URL' with an actual image URL
UPDATE public.articles
SET main_image_url = 'YOUR_PLACEHOLDER_IMAGE_URL'
WHERE status IN ('published', 'anonymous', 'unpublished', 'archived')
  AND (main_image_url IS NULL OR main_image_url = '');

-- 3. Update the trigger function to enforce main image for published statuses
CREATE OR REPLACE FUNCTION public.enforce_min_tags_for_non_draft()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  tcount INT;
BEGIN
  IF (NEW.status IN ('published', 'anonymous', 'unpublished', 'archived')) THEN
    -- Check tags
    SELECT COUNT(*) INTO tcount
    FROM public.article_tags at
    WHERE at.article_id = NEW.id;

    IF tcount < 2 THEN
      RAISE EXCEPTION 'Need at least 2 tags to set status to % (have %).', NEW.status, tcount;
    END IF;

    -- Check main image
    IF NEW.main_image_url IS NULL OR NEW.main_image_url = '' THEN
      RAISE EXCEPTION 'Need a main image to set status to %.', NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
