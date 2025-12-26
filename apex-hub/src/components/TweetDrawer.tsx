"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { X, ExternalLink, Heart, Bookmark, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        layoutId={`card-${tweet.tweet_id}`}
                        className="fixed right-0 top-0 h-full w-full md:w-[650px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-[70] overflow-hidden flex flex-col"
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    >
                        {/* Close Button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-zinc-900/50 rounded-full hover:bg-zinc-800 transition-colors z-20 border border-white/10"
                        >
                            <X size={20} className="text-zinc-400" />
                        </motion.button>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">

                            {/* Hero Media (Shared Element) */}
                            {tweet.media_urls && tweet.media_urls.length > 0 && (
                                <div className="relative w-full aspect-video">
                                    <Image
                                        src={tweet.media_urls[0]}
                                        alt="Tweet media"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                                </div>
                            )}

                            <div className="p-8 md:p-10">
                                {/* Header Info */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-400 border border-zinc-700">
                                        {tweet.user_name?.[0] || "?"}
                                    </div>
                                    <div>
                                        <div className="font-bold text-xl text-zinc-100">{tweet.user_name || "Unknown"}</div>
                                        <div className="text-zinc-500 text-sm">@{tweet.user_screen_name || "unknown"}</div>
                                    </div>
                                    <div className="ml-auto flex gap-2">
                                        <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-500">
                                            {tweet.source?.toUpperCase() || "APP"}
                                        </span>
                                    </div>
                                </div>

                                {/* Main Text */}
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-2xl leading-relaxed text-zinc-200 whitespace-pre-wrap font-serif mb-10"
                                >
                                    {tweet.full_text}
                                </motion.p>

                                {/* AI Insight Section (Placeholder) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-10 p-6 rounded-2xl bg-zinc-900/30 border border-emerald-500/20 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                                    <div className="flex items-center gap-2 mb-4 text-emerald-400">
                                        <Sparkles size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-3/4 bg-zinc-800/50 rounded animate-pulse" />
                                        <div className="h-2 w-full bg-zinc-800/50 rounded animate-pulse" />
                                        <div className="h-2 w-5/6 bg-zinc-800/50 rounded animate-pulse" />
                                    </div>
                                </motion.div>

                                {/* Metadata & Actions */}
                                <div className="flex flex-col gap-6 py-8 border-t border-zinc-800/50">
                                    <div className="flex justify-between text-zinc-500 text-sm font-mono">
                                        <span>Captured {tweet.captured_at ? formatDistanceToNow(new Date(tweet.captured_at)) : 'recently'} ago</span>
                                        <span>{tweet.tweet_created_at ? new Date(tweet.tweet_created_at).toLocaleDateString() : ''}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <ActionButton icon={Heart} label="Like" />
                                        <ActionButton icon={Bookmark} label="Save" />
                                        <a
                                            href={`https://twitter.com/${tweet.user_screen_name}/status/${tweet.tweet_id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                                        >
                                            <ExternalLink size={18} />
                                            <span className="font-medium">Open X</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Vector Similarity (Placeholder) */}
                                <div className="mt-4">
                                    <h3 className="text-xs font-bold text-zinc-600 mb-4 uppercase tracking-wider flex items-center gap-2">
                                        <Zap size={12} />
                                        Similar Content
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1, 2].map(i => (
                                            <div key={i} className="h-24 rounded-xl bg-zinc-900/50 border border-zinc-800/50 animate-pulse" />
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ActionButton({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all text-zinc-400 border border-zinc-800 hover:border-zinc-700 group">
            <Icon size={18} className="group-hover:text-emerald-400 transition-colors" />
            <span className="font-medium">{label}</span>
        </button>
    );
}
