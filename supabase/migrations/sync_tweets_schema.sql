-- ============================================================
-- APEX Tweets Table Schema Migration
-- Run this in Supabase SQL Editor to sync table structure
-- ============================================================

-- Option 1: If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS tweets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tweet_id TEXT UNIQUE NOT NULL,
    full_text TEXT,
    user_name TEXT,
    user_screen_name TEXT,
    user_avatar TEXT,
    media_urls JSONB DEFAULT '[]',
    video_url TEXT,
    tweet_created_at TIMESTAMPTZ,
    metrics JSONB DEFAULT '{"likes": 0, "retweets": 0, "replies": 0, "quotes": 0}',
    is_quoted BOOLEAN DEFAULT FALSE,
    source TEXT,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Option 2: If table exists, add missing columns (ALTER TABLE)
-- Run these one by one if you get errors on specific columns

-- Add user_avatar if missing
ALTER TABLE tweets ADD COLUMN IF NOT EXISTS user_avatar TEXT;

-- Add video_url if missing
ALTER TABLE tweets ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add metrics if missing
ALTER TABLE tweets ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{"likes": 0, "retweets": 0, "replies": 0, "quotes": 0}';

-- Add is_quoted if missing
ALTER TABLE tweets ADD COLUMN IF NOT EXISTS is_quoted BOOLEAN DEFAULT FALSE;

-- Add tweet_created_at if missing (this was called 'created_at' in code but maps differently)
ALTER TABLE tweets ADD COLUMN IF NOT EXISTS tweet_created_at TIMESTAMPTZ;

-- Add captured_at if missing
ALTER TABLE tweets ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ DEFAULT NOW();

-- Add created_at (row creation time) if missing
ALTER TABLE tweets ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Rename 'created_at' to 'tweet_created_at' if needed (optional - only run if you have old data)
-- ALTER TABLE tweets RENAME COLUMN created_at TO tweet_created_at;

-- Create unique index on tweet_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_tweets_tweet_id ON tweets(tweet_id);

-- ============================================================
-- Enable Row Level Security (RLS) - Optional but recommended
-- ============================================================

ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY IF NOT EXISTS "Allow all for authenticated" ON tweets
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow anon users to insert (for extension to work without auth)
CREATE POLICY IF NOT EXISTS "Allow insert for anon" ON tweets
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- ============================================================
-- Verify: Check table structure after migration
-- ============================================================
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'tweets';
