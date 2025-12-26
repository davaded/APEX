"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { TweetCard } from "./TweetCard";
import { TweetDrawer } from "./TweetDrawer";
import { ConsoleBlock } from "./ConsoleBlock";

// Initialize client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

interface Tweet {
    id: string;
    tweet_id: string;
    full_text?: string;
    user_screen_name?: string;
    user_name?: string;
    media_urls?: string[];
    tweet_created_at?: string;
    source?: string;
    captured_at?: string;
}

export function TweetFeed() {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);

    useEffect(() => {
        if (!supabase) {
            console.error("Supabase client not initialized. Check .env.local");
            return;
        }

        async function fetchTweets() {
            const { data, error } = await supabase!
                .from("tweets")
                .select("*")
                .order("captured_at", { ascending: false })
                .limit(50);

            if (error) {
                console.error("Error fetching tweets:", error);
            } else {
                setTweets(data || []);
            }
            setLoading(false);
        }

        fetchTweets();

        // Realtime subscription
        const channel = supabase
            .channel("public:tweets")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "tweets" },
                (payload) => {
                    console.log("New tweet received:", payload);
                    setTweets((prev) => [payload.new as Tweet, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-64 bg-zinc-900/50 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-24">
                    {/* Pinned Console Block */}
                    <div className="break-inside-avoid mb-6">
                        <ConsoleBlock />
                    </div>

                    {tweets.map((tweet) => (
                        <div key={tweet.id} className="break-inside-avoid mb-6">
                            <TweetCard
                                tweet={tweet}
                                onClick={(t) => setSelectedTweet(t)}
                            />
                        </div>
                    ))}
                </div>
            )}

            <TweetDrawer
                tweet={selectedTweet}
                onClose={() => setSelectedTweet(null)}
            />
        </div>
    );
}
