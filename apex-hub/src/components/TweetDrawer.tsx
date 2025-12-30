"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { X, ExternalLink, Heart, Bookmark, Sparkles, Zap, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    ai_summary?: string; // Optional field for AI summary
    urls?: string[]; // Optional field for extracted URLs
}

interface TweetDrawerProps {
    tweet: Tweet | null;
    onClose: () => void;
}

export function TweetDrawer({ tweet, onClose }: TweetDrawerProps) {
    // Quick Look: Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Extract title (first sentence)
    const title = tweet?.full_text?.split(/[.!?\n]/).filter(Boolean)[0] || "Tweet";
    const body = tweet?.full_text?.replace(title, "").trim() || "";
    // Simplified Mock for URLs if not present
    const urls = tweet?.urls || (tweet?.full_text?.match(/https?:\/\/[^\s]+/g) || []);

    return (
        <AnimatePresence>
            {tweet && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer Panel - Zen Mode */}
                    <motion.div
                        layoutId={`card-${tweet.tweet_id}`}
                        className="fixed right-0 top-0 h-full w-full md:w-[700px] bg-[#050505] text-zinc-200 border-l border-zinc-900 shadow-2xl z-[70] flex flex-col"
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    >
                        {/* 1. Top Toolbar (Zen Toolbar) */}
                        <div className="absolute top-6 right-6 z-50 flex items-center gap-3 pointer-events-auto">
                            <a
                                href={`/tweet/${tweet.tweet_id}`}
                                className="rounded-full bg-black/50 p-2 text-white/70 backdrop-blur-md border border-white/5 hover:bg-white/20 hover:text-white transition-all transform hover:scale-105 group"
                                title="Expand to Reader"
                            >
                                <Maximize2 size={18} className="group-hover:text-emerald-400 transition-colors" />
                            </a>

                            <a
                                href={`https://twitter.com/${tweet.user_screen_name}/status/${tweet.tweet_id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-md border border-white/5 hover:bg-white/20 hover:text-white transition-all"
                            >
                                <span>Open on X</span>
                                <ExternalLink size={12} />
                            </a>

                            <button
                                onClick={onClose}
                                className="rounded-full bg-black/50 p-2 text-white/70 backdrop-blur-md border border-white/5 hover:bg-white/20 hover:text-white transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <ScrollArea className="flex-1 h-full">
                            {/* 2. Hero Media */}
                            {tweet.media_urls && tweet.media_urls.length > 0 && (
                                <div className="relative w-full group">
                                    <div className="relative w-full max-h-[500px] aspect-video">
                                        <Image
                                            src={tweet.media_urls[0]}
                                            alt="Tweet media"
                                            fill
                                            className="object-cover brightness-[0.85] transition-all duration-500 group-hover:brightness-100"
                                        />
                                    </div>
                                    {/* Bottom Gradient Mask */}
                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />
                                </div>
                            )}

                            <div className={cn("px-8 pb-32", tweet.media_urls?.length ? "pt-6" : "pt-24")}>
                                {/* 3. AI Insight (The Oracle) */}
                                {tweet.ai_summary && (
                                    <div className="mb-8 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-black p-6">
                                        <div className="mb-3 flex items-center gap-2 text-emerald-500">
                                            <Sparkles size={16} />
                                            <span className="text-xs font-bold tracking-widest uppercase">AI Insight</span>
                                        </div>
                                        <p className="font-serif text-lg italic leading-relaxed text-emerald-100/90">
                                            "{tweet.ai_summary}"
                                        </p>
                                    </div>
                                )}

                                {/* 4. Author & Metadata */}
                                <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={tweet.user_avatar_url} name={tweet.user_name} />
                                        <div>
                                            <div className="font-bold text-zinc-100">{tweet.user_name}</div>
                                            <div className="text-xs text-zinc-500">
                                                @{tweet.user_screen_name} • Captured {tweet.captured_at ? formatDistanceToNow(new Date(tweet.captured_at)) : 'recently'} ago
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Immersive Body */}
                                <article className="prose prose-invert prose-lg max-w-none">
                                    {!tweet.ai_summary && title && (
                                        <h1 className="font-serif text-2xl text-zinc-100 mb-6 leading-tight">{title}</h1>
                                    )}
                                    <p className="text-zinc-300 font-sans font-light leading-8 text-lg whitespace-pre-wrap">
                                        {tweet.ai_summary ? tweet.full_text : body || tweet.full_text}
                                    </p>

                                    {/* Link Beautification */}
                                    {urls.length > 0 && (
                                        <div className="mt-8 flex flex-col gap-3 not-prose">
                                            {urls.map((url, i) => (
                                                <a
                                                    key={i}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 text-sm text-emerald-500/80 hover:text-emerald-400 transition-colors p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10"
                                                >
                                                    <ExternalLink size={16} />
                                                    <span className="truncate font-mono">{url}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </article>

                                {/* 6. Related Threads (Placeholder) */}
                                <div className="mt-16 pt-12 border-t border-white/5">
                                    <h3 className="mb-6 text-xs font-medium text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Zap size={14} />
                                        Related Threads
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <MiniCard />
                                        <MiniCard />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Spacer Strategy: Zen mode just needs a bottom spacer to prevent clipping */}
                            <div className="h-20" />
                        </ScrollArea>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function Avatar({ src, name }: { src?: string; name?: string }) {
    return (
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 ring-2 ring-black/50">
            {src ? (
                <Image src={src} alt={name || "User"} fill className="object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                    {name?.[0] || "?"}
                </div>
            )}
        </div>
    );
}

function MiniCard() {
    return (
        <div className="h-32 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors p-4 flex flex-col justify-between cursor-pointer group">
            <div className="w-8 h-1 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors" />
            <div className="space-y-2">
                <div className="h-2 w-3/4 bg-zinc-800/50 rounded" />
                <div className="h-2 w-1/2 bg-zinc-800/50 rounded" />
            </div>
        </div>
    );
}
