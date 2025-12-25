-- ============================================================
-- APEX Tweets Table - ADD MISSING COLUMNS
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add missing columns to tweets table
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS user_avatar TEXT;
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS tweet_url TEXT;
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}';
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS is_quoted BOOLEAN DEFAULT FALSE;

-- Allow more source types
ALTER TABLE public.tweets DROP CONSTRAINT IF EXISTS tweets_source_check;
ALTER TABLE public.tweets ADD CONSTRAINT tweets_source_check 
    CHECK (source IN ('like', 'bookmark', 'extension_capture', 'likes_timeline', 'bookmarks_timeline'));

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tweets'
ORDER BY ordinal_position;
