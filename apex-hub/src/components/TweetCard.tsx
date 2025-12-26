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
    const mediaCount = tweet.media_urls?.length || 0;

    return (
        <motion.div
            layoutId={`card-${tweet.tweet_id}`}
            onClick={() => onClick?.(tweet)}
            whileHover={{ y: -2 }}
            className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-3xl overflow-hidden cursor-pointer transition-colors hover:bg-zinc-900/60 hover:border-zinc-700/50"
        >
            {/* Media Grid */}
            {hasMedia && (
                <div className={`relative w-full overflow-hidden border-b border-zinc-800/50 ${mediaCount > 1 ? 'grid grid-cols-2 gap-px bg-zinc-800/50' : 'aspect-video'}`}>
                    {tweet.media_urls!.slice(0, 4).map((url, index) => (
                        <div key={index} className={`relative ${mediaCount === 1 ? 'w-full h-full' : 'aspect-square'} ${mediaCount === 3 && index === 0 ? 'row-span-2 h-full' : ''}`}>
                            <Image
                                src={url}
                                alt="Tweet media"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Content Section */}
            <div className="p-8 flex flex-col gap-4">

                {/* Text Content: Fixed 17px Serif, Line-height 1.6 */}
                <p className="font-serif text-[17px] leading-[1.6] text-zinc-200 line-clamp-3 group-hover:text-zinc-100 transition-colors">
                    {tweet.full_text}
                </p>

                {/* Decoupled Metadata (Bottom, Fade in on Hover) */}
                <div className="flex items-center justify-between pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-400 border border-zinc-700/50">
                            {tweet.user_name?.[0] || "?"}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-[12px] font-medium text-zinc-300 font-sans">{tweet.user_name}</span>
                            <span className="text-[11px] text-zinc-600 font-sans">@{tweet.user_screen_name}</span>
                        </div>
                    </div>

                    <span className="text-[11px] text-zinc-600 font-mono tracking-tight">
                        {tweet.tweet_created_at ? formatDistanceToNow(new Date(tweet.tweet_created_at)) : 'now'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
