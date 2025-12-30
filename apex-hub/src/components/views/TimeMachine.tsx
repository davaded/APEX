"use client";

import { useEffect, useState } from "react";
import { fetchActivityHeatmap, ActivityData } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import { TweetCard } from "@/components/TweetCard";
import { TweetDrawer } from "@/components/TweetDrawer";
import { AnimatePresence, motion } from "framer-motion";
import { format, subDays, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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

// --- Heatmap Component ---
function Heatmap({ data, onSelectDate, selectedDate }: { data: ActivityData[], onSelectDate: (date: Date) => void, selectedDate: Date | null }) {
    // Generate last 365 days
    const today = new Date();
    const days = eachDayOfInterval({
        start: subDays(today, 364),
        end: today
    });

    // Create a map for O(1) lookups
    const dataMap = new Map(data.map(d => [d.date, d.count]));

    // Determine color intensity
    const getColor = (count: number) => {
        if (count === 0) return "bg-zinc-900";
        if (count <= 2) return "bg-emerald-900/40";
        if (count <= 5) return "bg-emerald-700/60";
        if (count <= 10) return "bg-emerald-500/80";
        return "bg-emerald-400";
    };

    return (
        <div className="flex flex-wrap gap-1 max-w-full overflow-x-auto pb-4 custom-scrollbar">
            {days.map((day, i) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const count = dataMap.get(dateKey) || 0;
                const isSelected = selectedDate && isSameDay(selectedDate, day);

                return (
                    <div
                        key={i}
                        onClick={() => onSelectDate(day)}
                        className={cn(
                            "w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-white/50",
                            getColor(count),
                            isSelected && "ring-2 ring-white z-10 scale-125 shadow-lg shadow-white/20"
                        )}
                        title={`${dateKey}: ${count} tweets`}
                    />
                );
            })}
        </div>
    );
}

// --- Main View ---

export function TimeMachine() {
    const [heatmapData, setHeatmapData] = useState<ActivityData[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [loadingHeatmap, setLoadingHeatmap] = useState(true);
    const [loadingTweets, setLoadingTweets] = useState(false);
    const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);

    // 1. Load Heatmap Data
    useEffect(() => {
        async function load() {
            setLoadingHeatmap(true);
            const data = await fetchActivityHeatmap();
            setHeatmapData(data);
            setLoadingHeatmap(false);
        }
        load();
    }, []);

    // 2. Load Tweets for Selected Date
    useEffect(() => {
        if (!selectedDate) return;

        async function loadTweets() {
            setLoadingTweets(true);
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const start = `${dateStr}T00:00:00`;
            const end = `${dateStr}T23:59:59`;

            const { data, error } = await supabase
                .from("tweets")
                .select("*")
                .gte("captured_at", start)
                .lte("captured_at", end)
                .order("captured_at", { ascending: false });

            if (data) {
                setTweets(data as any);
            }
            setLoadingTweets(false);
        }
        loadTweets();
    }, [selectedDate]);

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-serif text-zinc-100 flex items-center gap-4 mb-2">
                    <Clock className="w-8 h-8 text-emerald-500" />
                    Time Machine
                </h2>
                <p className="text-zinc-500 text-lg font-light">
                    Visualize your knowledge capture velocity over time.
                </p>
            </div>

            {/* Heatmap Section */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                        Activity Heatmap (Last 365 Days)
                    </div>
                    {loadingHeatmap && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
                </div>

                <Heatmap
                    data={heatmapData}
                    onSelectDate={setSelectedDate}
                    selectedDate={selectedDate}
                />

                <div className="flex items-center gap-2 text-xs text-zinc-600 justify-end">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-zinc-900" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-900/40" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-700/60" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                    <span>More</span>
                </div>
            </div>

            {/* Timeline List Section */}
            <div>
                <div className="flex items-center justify-between mb-8 sticky top-24 bg-[#050505]/95 backdrop-blur-md py-4 z-30 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-emerald-500" />
                        <span className="text-xl font-serif text-zinc-200">
                            {selectedDate ? format(selectedDate, "MMMM do, yyyy") : "Select a date"}
                        </span>
                    </div>
                    <div className="text-sm text-zinc-500 font-mono">
                        {tweets.length} {tweets.length === 1 ? 'entry' : 'entries'} captured
                    </div>
                </div>

                {loadingTweets ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : tweets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {tweets.map(tweet => (
                            <TweetCard
                                key={tweet.id}
                                tweet={tweet as any}
                                onClick={(t) => setSelectedTweet(t as any)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-zinc-600" />
                        </div>
                        <p className="text-zinc-500 font-serif italic text-lg">No knowledge captured on this day.</p>
                    </div>
                )}
            </div>

            {/* Tweet Drawer Logic */}
            <AnimatePresence>
                {selectedTweet && (
                    <TweetDrawer tweet={selectedTweet as any} onClose={() => setSelectedTweet(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
