"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tweet {
    id: string;
    tweet_id: string;
    full_text?: string;
    user_screen_name?: string;
    user_name?: string;
    user_avatar_url?: string;
    media_urls?: string[];
    tweet_created_at?: string;
    source?: string;
    captured_at?: string;
}

interface TweetRowProps {
    tweet: Tweet;
    isSelected?: boolean;
    onSelect?: (selected: boolean) => void;
    onClick?: (tweet: Tweet) => void;
}

export function TweetRow({ tweet, isSelected, onSelect, onClick }: TweetRowProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
                // If clicking checkbox area (handled by parent logic usually, but here we separate)
                // For now, let's say clicking the row opens it, unless clicking checkbox
                onClick?.(tweet);
            }}
            className={cn(
                "group flex items-center gap-4 px-4 h-[56px] border-b border-zinc-800/50 cursor-pointer transition-colors",
                isSelected ? "bg-emerald-900/10 border-emerald-900/20" : "hover:bg-zinc-900/30"
            )}
        >
            {/* Avatar / Checkbox Toggle */}
            <div
                className="flex-shrink-0 w-8 h-8 relative flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(!isSelected);
                }}
            >
                {/* Checkbox (Visible on Hover or Selected) */}
                <div className={cn(
                    "absolute inset-0 rounded-full border flex items-center justify-center transition-all duration-200 z-10",
                    isSelected
                        ? "bg-emerald-500 border-emerald-500 opacity-100 scale-100"
                        : isHovered
                            ? "bg-zinc-800 border-zinc-600 opacity-100 scale-100"
                            : "opacity-0 scale-90"
                )}>
                    <Check className="w-4 h-4 text-white" />
                </div>

                {/* Avatar (Hidden on Hover or Selected) */}
                <div className={cn(
                    "w-full h-full rounded-full overflow-hidden relative border border-zinc-700/30 transition-all duration-200",
                    (isHovered || isSelected) ? "opacity-0 scale-90" : "opacity-100 scale-100"
                )}>
                    {tweet.user_avatar_url ? (
                        <Image
                            src={tweet.user_avatar_url}
                            alt={tweet.user_name || "User"}
                            fill
                            className="object-cover opacity-80 group-hover:opacity-100"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-[10px] font-bold text-zinc-500">
                            {tweet.user_name?.[0] || "?"}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 min-w-0 flex items-center gap-6">
                {/* Tweet Text Preview (Primary) */}
                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-sm truncate font-serif transition-colors",
                        isSelected ? "text-emerald-100" : "text-zinc-400 group-hover:text-zinc-200"
                    )}>
                        {tweet.full_text}
                    </p>
                </div>

                {/* AI Tags (Capsules) */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Placeholder AI Tags */}
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-medium">
                        #Tech
                    </span>
                    {tweet.media_urls && tweet.media_urls.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-medium">
                            Media
                        </span>
                    )}
                </div>

                {/* Timestamp */}
                <div className="w-24 text-right text-xs text-zinc-600 font-mono">
                    {tweet.tweet_created_at ? formatDistanceToNow(new Date(tweet.tweet_created_at)) : 'now'}
                </div>
            </div>
        </motion.div>
    );
}
