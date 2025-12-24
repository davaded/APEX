-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Create Tweets Table
create table public.tweets (
  id uuid default gen_random_uuid() primary key,
  tweet_id text not null,
  full_text text,
  user_screen_name text,
  user_name text,
  media_urls jsonb,
  tweet_created_at timestamptz,
  captured_at timestamptz default now(),
  source text check (source in ('like', 'bookmark', 'extension_capture')),
  embedding vector(1536) -- OpenAI text-embedding-3-small dimension
);

-- Add unique index for tweet_id to prevent duplicates
create unique index tweets_tweet_id_idx on public.tweets (tweet_id);

-- Add HNSW index for fast vector similarity search
create index tweets_embedding_idx on public.tweets using hnsw (embedding vector_cosine_ops);

-- 3. Create Tags Table
create table public.tags (
  id serial primary key,
  name text unique not null
);

-- 4. Create Tweet-Tags Join Table
create table public.tweet_tags (
  tweet_id uuid references public.tweets(id) on delete cascade,
  tag_id int references public.tags(id) on delete cascade,
  primary key (tweet_id, tag_id)
);

-- 5. Enable Row Level Security (RLS)
alter table public.tweets enable row level security;
alter table public.tags enable row level security;
alter table public.tweet_tags enable row level security;

-- Create generic policies (Allow all for MVP, restrict later)
create policy "Allow public read access" on public.tweets for select using (true);
create policy "Allow public insert access" on public.tweets for insert with check (true);
create policy "Allow public update access" on public.tweets for update using (true);

create policy "Allow public read access" on public.tags for select using (true);
create policy "Allow public insert access" on public.tags for insert with check (true);

create policy "Allow public read access" on public.tweet_tags for select using (true);
create policy "Allow public insert access" on public.tweet_tags for insert with check (true);

-- 6. Enable Realtime for tweets table
alter publication supabase_realtime add table public.tweets;
