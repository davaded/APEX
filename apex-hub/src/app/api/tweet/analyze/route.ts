import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeTweetContent } from '@/lib/openai';

export async function POST(req: Request) {
    try {
        const { tweetId, text } = await req.json();

        // Extract AI config from headers
        const apiKey = req.headers.get('x-openai-key') || undefined;
        const baseURL = req.headers.get('x-openai-base-url') || undefined;
        const model = req.headers.get('x-openai-model') || undefined;
        const config = { apiKey, baseURL, model };

        if (!tweetId || !text) {
            return NextResponse.json({ error: 'Tweet ID and text are required' }, { status: 400 });
        }

        // 1. Analyze content using AI
        const { tags, summary } = await analyzeTweetContent(text, config);

        if (!tags.length && !summary) {
            return NextResponse.json({ error: 'Failed to analyze tweet' }, { status: 500 });
        }

        // 2. Update tweet with summary
        const { error: updateError } = await supabase
            .from('tweets')
            .update({ ai_summary: summary })
            .eq('tweet_id', tweetId);

        if (updateError) {
            console.error('Error updating tweet summary:', updateError);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        // 3. Handle Tags (Insert new tags and link them)
        // Note: This is a simplified implementation. In a real app, you'd handle existing tags more robustly.
        // For MVP, we'll just return the tags and let the frontend display them, 
        // or we can implement the tag linking logic here if the 'tags' table is ready.

        // Let's try to insert tags into the 'tags' table and link them
        for (const tagName of tags) {
            // A. Insert Tag if not exists
            const { data: tagData, error: tagError } = await supabase
                .from('tags')
                .select('id')
                .eq('name', tagName)
                .single();

            let tagId;

            if (!tagData) {
                const { data: newTag, error: insertError } = await supabase
                    .from('tags')
                    .insert({ name: tagName })
                    .select('id')
                    .single();

                if (newTag) tagId = newTag.id;
            } else {
                tagId = tagData.id;
            }

            // B. Link Tag to Tweet
            if (tagId) {
                // We need the UUID of the tweet, not the string tweet_id
                const { data: tweetData } = await supabase
                    .from('tweets')
                    .select('id')
                    .eq('tweet_id', tweetId)
                    .single();

                if (tweetData) {
                    await supabase
                        .from('tweet_tags')
                        .upsert({ tweet_id: tweetData.id, tag_id: tagId }, { onConflict: 'tweet_id, tag_id', ignoreDuplicates: true });
                }
            }
        }

        return NextResponse.json({ tags, summary });

    } catch (error) {
        console.error('Analyze API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
