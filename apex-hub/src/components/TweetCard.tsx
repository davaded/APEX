"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface Tweet {
    id: string;
    tweet_id: string;
    full_text?: string;
    user_screen_name?: string;
    user_name?: string;
    media_urls?: string[]; // Stored as JSONB in DB, parsed as string[] here
    tweet_created_at?: string;
    source?: string;
    captured_at?: string;
}

interface TweetCardProps {
    tweet: Tweet;
    onClick?: (tweet: Tweet) => void;
}

export function TweetCard({ tweet, onClick }: TweetCardProps) {
    const hasMedia = tweet.media_urls && tweet.media_urls.length > 0;
    const isShortText = !hasMedia && (tweet.full_text?.length || 0) < 140;

    return (
        <motion.div
            layoutId={`card-${tweet.tweet_id}`}
            onClick={() => onClick?.(tweet)}
            whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
            className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer transition-colors hover:border-zinc-700"
        >
            {/* Media or Hero Section */}
            {hasMedia && (
                <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                        src={tweet.media_urls![0]}
                        alt="Tweet media"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        draggable={false}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-zinc-900/80 to-transparent" />
                </div>
            )}

            {/* Content Section */}
            <div className={`p-5 ${isShortText ? "flex flex-col justify-center min-h-[160px] text-center" : ""}`}>
                {/* Author Info (Hidden by default or subtle) */}
                {!isShortText && (
                    <div className="flex items-center gap-2 mb-2 text-zinc-500 text-xs">
                        <span className="font-medium text-zinc-400">@{tweet.user_screen_name}</span>
                        <span>•</span>
                        <span>{tweet.tweet_created_at ? formatDistanceToNow(new Date(tweet.tweet_created_at)) : 'Recently'}</span>
                    </div>
                )}

                {/* Text Content */}
                <p className={`text-zinc-200 ${isShortText ? "font-serif text-2xl leading-tight text-white" : "text-sm leading-relaxed line-clamp-4"}`}>
                    {tweet.full_text}
                </p>

                {/* Short Text Author Footer */}
                {isShortText && (
                    <div className="mt-4 text-zinc-500 text-xs font-mono uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                        @{tweet.user_screen_name}
                    </div>
                )}

                {/* Metadata Footer (Hover Reveal) */}
                <div className="absolute bottom-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Add icons here later if needed */}
                    <div className="text-xs text-zinc-500 bg-zinc-950/50 px-2 py-1 rounded backdrop-blur-md">
                        {tweet.source}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
