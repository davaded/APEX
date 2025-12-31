"use client";

import { useEffect, useState } from "react";
import { fetchNeuralClusters, ClusterNode } from "@/lib/clusters";
import { Tag, Hash, Loader2, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TweetCard } from "@/components/TweetCard";
import { TweetDrawer } from "@/components/TweetDrawer";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// --- Types ---
interface Tweet {
    id: string; // UUID
    tweet_id: string;
    full_text: string;
    user_name: string;
    user_screen_name: string;
    user_avatar_url: string;
    media_urls?: string[];
    created_at: string;
    captured_at?: string;
    ai_summary?: string;
}

export function NeuralClusters() {
    const [nodes, setNodes] = useState<ClusterNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<ClusterNode | null>(null);
    const [relatedTweets, setRelatedTweets] = useState<Tweet[]>([]);
    const [loadingTweets, setLoadingTweets] = useState(false);
    const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);

    // Load Clusters
    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await fetchNeuralClusters();
            setNodes(data);
            setLoading(false);
        }
        load();
    }, []);

    // Load Tweets for Selected Node
    useEffect(() => {
        if (!selectedNode) return;

        async function loadRelated() {
            setLoadingTweets(true);
            // Search text for the keyword for now (since we generated these from text)
            const { data } = await supabase
                .from("tweets")
                .select("*")
                .ilike("full_text", `%${selectedNode.label}%`)
                .limit(10);

            if (data) setRelatedTweets(data as any);
            setLoadingTweets(false);
        }
        loadRelated();
    }, [selectedNode]);

    return (
        <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col relative animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex-none">
                <h2 className="text-4xl font-serif text-zinc-100 flex items-center gap-4 mb-2">
                    <Tag className="w-8 h-8 text-emerald-500" />
                    Neural Clusters
                </h2>
                <p className="text-zinc-500 text-lg font-light">
                    Explore your knowledge topology.
                </p>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/5 bg-[#080808] shadow-inner shadow-black/50">

                {/* Background Grid/Stars */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/10 via-[#050505] to-black" />

                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : (
                    <div className="absolute inset-0 p-10 flex flex-wrap content-center justify-center gap-8 md:gap-12">
                        {/* We arrange them in a flex wrap, but animate them to look floating */}
                        {nodes.map((node, i) => (
                            <motion.button
                                key={node.id}
                                onClick={() => setSelectedNode(node)}
                                layoutId={`node-${node.id}`}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: [0, -10, 0],
                                    x: [0, 5, 0]
                                }}
                                transition={{
                                    delay: i * 0.05,
                                    duration: 0.5,
                                    y: {
                                        duration: 3 + Math.random() * 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: Math.random() * 2
                                    },
                                    x: {
                                        duration: 4 + Math.random() * 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: Math.random() * 2
                                    }
                                }}
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                className={cn(
                                    "relative rounded-full flex items-center justify-center font-serif transition-colors backdrop-blur-sm border border-white/10 group shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]",
                                    selectedNode?.id === node.id
                                        ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.5)]"
                                        : "bg-white/5 text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-200 hover:border-emerald-500/50"
                                )}
                                style={{
                                    width: 80 + (node.value * 20), // 100px to 200px
                                    height: 80 + (node.value * 20),
                                    fontSize: 14 + (node.value * 2)
                                }}
                            >
                                <span className="relative z-10">{node.label}</span>
                                {/* Orbiting Particle (Cosmetic) */}
                                {node.value > 3 && (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 pointer-events-none"
                                    >
                                        <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 blur-[1px]" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sidebar / Overlay for Selected Node */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 h-screen w-full md:w-[480px] bg-[#0A0A0A]/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl z-50 p-6 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                    <Hash size={20} />
                                </div>
                                <h3 className="text-2xl font-serif text-white capitalize">{selectedNode.label}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {loadingTweets ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                </div>
                            ) : relatedTweets.length > 0 ? (
                                relatedTweets.map(tweet => (
                                    <TweetCard
                                        key={tweet.id}
                                        tweet={tweet as any}
                                        onClick={(t) => setSelectedTweet(t as any)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-10 text-zinc-500 italic">
                                    No cached threads found directly matching this concept.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tweet Details */}
            <AnimatePresence>
                {selectedTweet && (
                    <TweetDrawer tweet={selectedTweet as any} onClose={() => setSelectedTweet(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
