"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { X, ExternalLink, Heart, Bookmark } from "lucide-react";
import Image from "next/image";

interface Tweet {
    id: string;
    tweet_id: string;
    full_text?: string;
    user_screen_name?: string;
    user_name?: string;
    media_urls?: string[];
    tweet_created_at?: string;
    source?: string;
}

interface TweetDrawerProps {
    tweet: Tweet | null;
    onClose: () => void;
}

export function TweetDrawer({ tweet, onClose }: TweetDrawerProps) {
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60]"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        layoutId={`card-${tweet.tweet_id}`}
                        // Note: layoutId transition from card to drawer is tricky with different structures. 
                        // For MVP, we might use a simple slide-in, but keeping layoutId on key elements 
                        // (like the image) is the "pro" move. 
                        // For simplicity in this step, let's just do a smooth slide-in.
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-[70] overflow-y-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-zinc-900/50 rounded-full hover:bg-zinc-800 transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Hero Image */}
                        {tweet.media_urls && tweet.media_urls.length > 0 && (
                            <div className="relative w-full aspect-video">
                                <Image
                                    src={tweet.media_urls[0]}
                                    alt="Tweet media"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Content Container */}
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                                <div>
                                    <div className="font-bold text-lg">{tweet.user_name || "Unknown"}</div>
                                    <div className="text-zinc-500 text-sm">@{tweet.user_screen_name || "unknown"}</div>
                                </div>
                            </div>

                            {/* Text */}
                            <p className="text-xl leading-relaxed text-zinc-100 whitespace-pre-wrap font-serif mb-8">
                                {tweet.full_text}
                            </p>

                            {/* Stats / Metadata */}
                            <div className="flex flex-col gap-4 py-6 border-t border-zinc-800">
                                <div className="flex justify-between text-zinc-500 text-sm">
                                    <span>Captured via {tweet.source}</span>
                                    <span>{tweet.tweet_created_at ? formatDistanceToNow(new Date(tweet.tweet_created_at)) : 'Recently'}</span>
                                </div>

                                <div className="flex gap-4">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors text-zinc-400">
                                        <Heart size={18} />
                                        <span>Like</span>
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors text-zinc-400">
                                        <Bookmark size={18} />
                                        <span>Save</span>
                                    </button>
                                    <a
                                        href={`https://twitter.com/${tweet.user_screen_name}/status/${tweet.tweet_id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors text-zinc-400 ml-auto"
                                    >
                                        <ExternalLink size={18} />
                                        <span>Open on X</span>
                                    </a>
                                </div>
                            </div>

                            {/* Tags Placeholder */}
                            <div className="mt-8">
                                <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">AI Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["#Design", "#SaaS", "#Frontend"].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-medium border border-indigo-500/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
