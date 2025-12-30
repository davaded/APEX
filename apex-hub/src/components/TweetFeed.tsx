"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { TweetCard } from "./TweetCard";
import { TweetRow } from "./TweetRow";
import { TweetDrawer } from "./TweetDrawer";
import { QuoteCard } from "./QuoteCard";
import { ConsoleBlock } from "./ConsoleBlock";
import { useView } from "@/context/ViewContext";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase";

interface Tweet {
    id: string;
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
}

export function TweetFeed() {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { viewMode } = useView();

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

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
        <div className="p-8 max-w-7xl mx-auto relative">
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
                <div className={cn(
                    "gap-6 pb-24",
                    viewMode === 'grid'
                        ? "columns-1 md:columns-2 lg:columns-3 xl:columns-4 space-y-6"
                        : "max-w-5xl mx-auto flex flex-col border-t border-zinc-800/50" // Compact mode
                )}>
                    {/* Pinned Console Block - Hide in Compact Mode */}
                    {viewMode !== 'compact' && (
                        <div className="break-inside-avoid mb-6">
                            <ConsoleBlock />
                        </div>
                    )}

                    {tweets.map((tweet, index) => (
                        <div key={tweet.id} className="contents">
                            {/* Insert Quote Card every 6 items */}
                            {viewMode === 'grid' && index > 0 && index % 6 === 0 && (
                                <div className="break-inside-avoid mb-6">
                                    <QuoteCard />
                                </div>
                            )}

                            <div className={cn(
                                "break-inside-avoid",
                                viewMode === 'grid' ? "mb-6" : ""
                            )}>
                                {viewMode === 'compact' ? (
                                    <TweetRow
                                        tweet={tweet}
                                        isSelected={selectedIds.has(tweet.id)}
                                        onSelect={() => toggleSelection(tweet.id)}
                                        onClick={(t) => setSelectedTweet(t)}
                                    />
                                ) : (
                                    <TweetCard
                                        tweet={tweet}
                                        onClick={(t) => setSelectedTweet(t)}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Float Toolbar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <span className="text-sm font-medium text-zinc-300">{selectedIds.size} selected</span>
                    <div className="h-4 w-px bg-zinc-800" />
                    <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Move to Folder</button>
                    <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Tag</button>
                    <button className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">Delete</button>
                </div>
            )}

            <TweetDrawer
                tweet={selectedTweet}
                onClose={() => setSelectedTweet(null)}
            />
        </div>
    );
}
