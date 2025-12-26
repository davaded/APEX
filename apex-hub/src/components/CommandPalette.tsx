"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search, FileText, Tag, Trash, Zap, Command as CommandIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialize client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

interface SearchResult {
    id: string;
    tweet_id: string;
    full_text: string;
    user_screen_name: string;
    user_name: string;
}

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Debounced Search
    React.useEffect(() => {
        if (!query || !supabase) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("tweets")
                .select("id, tweet_id, full_text, user_screen_name, user_name")
                .ilike("full_text", `%${query}%`)
                .limit(5);

            if (!error && data) {
                setResults(data);
            }
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Command Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
                    >
                        <Command shouldFilter={false} className="w-full bg-transparent">
                            <div className="flex items-center border-b border-zinc-800 px-4" cmdk-input-wrapper="">
                                <Search className="mr-2 h-5 w-5 shrink-0 text-zinc-500" />
                                <Command.Input
                                    value={query}
                                    onValueChange={setQuery}
                                    placeholder="Search tweets or type a command..."
                                    className="flex h-14 w-full rounded-md bg-transparent py-3 text-lg outline-none placeholder:text-zinc-500 text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono border border-zinc-800 rounded px-1.5 py-0.5">
                                    <span>ESC</span>
                                </div>
                            </div>

                            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 scroll-py-2 custom-scrollbar">
                                {loading && (
                                    <div className="py-6 flex justify-center text-zinc-500">
                                        <Loader2 className="animate-spin w-5 h-5" />
                                    </div>
                                )}

                                {!loading && results.length === 0 && query && (
                                    <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                                        No tweets found.
                                    </Command.Empty>
                                )}

                                {/* Dynamic Search Results */}
                                {results.length > 0 && (
                                    <Command.Group heading="Tweets" className="text-xs font-medium text-zinc-500 px-2 py-1.5 mb-2">
                                        {results.map((tweet) => (
                                            <CommandItem
                                                key={tweet.id}
                                                icon={Search}
                                                label={`${tweet.user_name}: ${tweet.full_text.substring(0, 40)}...`}
                                                onSelect={() => {
                                                    console.log("Selected tweet:", tweet.tweet_id);
                                                    setOpen(false);
                                                    // TODO: Open tweet drawer
                                                }}
                                            />
                                        ))}
                                    </Command.Group>
                                )}

                                <Command.Group heading="Actions" className="text-xs font-medium text-zinc-500 px-2 py-1.5 mb-2">
                                    <CommandItem icon={Zap} label="Ask AI Assistant" shortcut="A" />
                                    <CommandItem icon={FileText} label="Export to Markdown" shortcut="E" />
                                    <CommandItem icon={Tag} label="Manage Tags" shortcut="T" />
                                </Command.Group>

                                <Command.Group heading="Navigation" className="text-xs font-medium text-zinc-500 px-2 py-1.5 mb-2">
                                    <CommandItem icon={CommandIcon} label="Go to Dashboard" onSelect={() => router.push('/')} />
                                    <CommandItem icon={Trash} label="Trash" />
                                </Command.Group>
                            </Command.List>

                            <div className="border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500">
                                <div className="flex gap-2">
                                    <span>Select</span>
                                    <kbd className="bg-zinc-900 border border-zinc-800 rounded px-1">↵</kbd>
                                </div>
                                <div className="flex gap-2">
                                    <span>Navigate</span>
                                    <kbd className="bg-zinc-900 border border-zinc-800 rounded px-1">↑↓</kbd>
                                </div>
                            </div>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function CommandItem({ icon: Icon, label, shortcut, onSelect }: { icon: any, label: string, shortcut?: string, onSelect?: () => void }) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm text-zinc-300 outline-none data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors group"
        >
            <Icon className="mr-3 h-4 w-4 text-zinc-500 group-data-[selected=true]:text-emerald-500" />
            <span className="truncate">{label}</span>
            {shortcut && (
                <span className="ml-auto text-xs tracking-widest text-zinc-600 group-data-[selected=true]:text-zinc-400">
                    ⌘{shortcut}
                </span>
            )}
        </Command.Item>
    );
}
