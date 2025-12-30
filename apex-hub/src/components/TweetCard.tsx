"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { X } from "lucide-react";

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

interface TweetCardProps {
    tweet: Tweet;
    onClick?: (tweet: Tweet) => void;
}

export function TweetCard({ tweet, onClick }: TweetCardProps) {
    const hasMedia = tweet.media_urls && tweet.media_urls.length > 0;
    const mediaCount = tweet.media_urls?.length || 0;

    // Mock detection of a "Quote" (e.g., if text starts with a quote mark or is short)
    // In a real app, this would come from the DB as a `quoted_status` object.
    // For now, we'll style the main text as a quote if it's short (< 140 chars) and has no media, just to demonstrate the style.
    const isQuoteStyle = !hasMedia && (tweet.full_text?.length || 0) < 140;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} // Smooth cubic-bezier
            onClick={() => onClick?.(tweet)}
            className="group relative bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl overflow-hidden cursor-pointer shadow-[0_0_0_1px_rgba(255,255,255,0.02)] border border-white/5"
            style={{
                boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
            }}
        >
            {/* Header: User Info & Actions */}
            <div className="flex items-start justify-between p-6 pb-2">
                <div className="flex items-center gap-3">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-800 ring-1 ring-white/10">
                        {tweet.user_avatar_url ? (
                            <Image
                                src={tweet.user_avatar_url}
                                alt={tweet.user_name || "User"}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                                {tweet.user_name?.[0] || "?"}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium text-zinc-300 font-sans tracking-wide">{tweet.user_name}</span>
                        <span className="text-[11px] text-zinc-500 font-sans">@{tweet.user_screen_name}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Smart Tag: Only green element */}
                    <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-medium text-emerald-400 tracking-wider uppercase">
                        AI Insight
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[10px] text-slate-500 font-mono" suppressHydrationWarning>
                            {tweet.tweet_created_at ? formatDistanceToNow(new Date(tweet.tweet_created_at), { addSuffix: true }).replace('about ', '') : 'now'}
                        </span>
                        <a
                            href={`https://x.com/${tweet.user_screen_name}/status/${tweet.tweet_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <X className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className={`px-6 pb-6 ${hasMedia ? 'pt-2' : 'pt-2'}`}>
                {isQuoteStyle ? (
                    // Quote Card Style
                    // Quote Card Style
                    <div className="relative p-6 rounded-xl bg-zinc-900/40 border border-zinc-800">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-700 rounded-l-xl" />
                        <p className="font-[family-name:var(--font-playfair)] italic text-[18px] leading-relaxed text-zinc-300">
                            "{tweet.full_text}"
                        </p>
                    </div>
                ) : (
                    // Standard Text Style
                    <p className="font-serif text-[16px] leading-[1.625] text-zinc-400 group-hover:text-zinc-200 transition-colors whitespace-pre-wrap line-clamp-5">
                        {tweet.full_text}
                    </p>
                )}
            </div>

            {/* Media Grid (Full Bleed) */}
            {hasMedia && (
                <div className={`relative w-full overflow-hidden ${mediaCount > 1 ? 'grid grid-cols-2 gap-0.5' : 'aspect-video'}`}>
                    {tweet.media_urls!.slice(0, 4).map((url, index) => (
                        <div key={index} className={`relative ${mediaCount === 1 ? 'w-full h-full' : 'aspect-square'} ${mediaCount === 3 && index === 0 ? 'row-span-2 h-full' : ''}`}>
                            <Image
                                src={url}
                                alt="Tweet media"
                                fill
                                className="object-cover transition-all duration-700 brightness-75 group-hover:brightness-100 group-hover:scale-105"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
