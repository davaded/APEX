import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // 1. Perform simple text search (Embedding disabled)
        const { data: tweets, error } = await supabase
            .from('tweets')
            .select('tweet_id, full_text, user_name, tweet_created_at')
            .ilike('full_text', `%${query}%`)
            .limit(10);

        if (error) {
            console.error("Search error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ tweets });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
