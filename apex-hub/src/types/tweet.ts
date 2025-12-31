export interface Tweet {
    id: string; // UUID
    tweet_id: string;
    tweet_url?: string;
    full_text?: string;
    user_screen_name?: string;
    user_name?: string;
    user_avatar_url?: string;
    media_urls?: string[];
    video_url?: string;
    metrics?: {
        likes: number;
        retweets: number;
        replies: number;
        quotes: number;
    };
    is_quoted?: boolean;
    tweet_created_at?: string;
    source?: string;
    captured_at?: string;
    ai_summary?: string;
    urls?: string[];
    embedding?: number[];
}
