"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useView, AppSection } from "@/context/ViewContext";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Search, Hash, User, FileText, Sparkles, LayoutGrid, Clock, BarChart2, Settings, ArrowRight } from "lucide-react";

interface SearchResult {
    tweet_id: string;
    full_text: string;
    user_name: string;
}

export function CommandCenter() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const router = useRouter();
    const { setActiveApp } = useView();

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
        const handleSearch = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                // Get config from localStorage
                const apiKey = localStorage.getItem("apex_openai_key") || "";
                const baseURL = localStorage.getItem("apex_openai_base_url") || "";

                // Use the new Semantic Search API
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-openai-key': apiKey,
                        'x-openai-base-url': baseURL
                    },
                    body: JSON.stringify({ query: query })
                });

                if (response.ok) {
                    const data = await response.json();
                    setResults(data.tweets || []);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error("Search API failed:", response.status, response.statusText, errorData);
                    setResults([]);
                }
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(handleSearch, 500); // 500ms debounce
        return () => clearTimeout(debounce);
    }, [query]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
            <CommandInput
                placeholder="Type a command or search..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList className="custom-scrollbar">
                <CommandEmpty>No results found.</CommandEmpty>

                {query.length > 0 && (
                    <CommandGroup heading="Search Results">
                        {results.map((result) => (
                            <CommandItem
                                key={result.tweet_id}
                                value={`${result.user_name} ${result.tweet_id} ${result.full_text}`}
                                onSelect={() => runCommand(() => router.push(`/tweet/${result.tweet_id}`))}
                                onMouseDown={(e) => {
                                    // Backup interaction handler
                                    if (e.button === 0) {
                                        e.preventDefault();
                                        runCommand(() => router.push(`/tweet/${result.tweet_id}`));
                                    }
                                }}
                                className="group flex cursor-pointer items-center justify-between rounded-lg border border-transparent px-4 py-3 transition-all hover:bg-white/5 hover:border-white/5 active:scale-[0.99] aria-selected:bg-transparent data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                            >
                                <div className="flex items-center gap-3 overflow-hidden w-full">
                                    {/* Icon */}
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-zinc-500 group-hover:text-emerald-500 group-hover:bg-emerald-950/30 transition-colors">
                                        <FileText size={16} />
                                    </div>

                                    <div className="flex flex-col overflow-hidden">
                                        <span className="truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                                            {result.user_name}
                                        </span>
                                        <span className="truncate text-xs text-zinc-500">
                                            {result.full_text}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow: Hover only */}
                                <ArrowRight size={14} className="text-zinc-600 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 ml-2 shrink-0" />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                <CommandSeparator />

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => setActiveApp('dashboard'))}>
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>The Nexus (Dashboard)</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setActiveApp('timeline'))}>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Time Machine</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setActiveApp('tags'))}>
                        <Hash className="mr-2 h-4 w-4" />
                        <span>Neural Clusters</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setActiveApp('analytics'))}>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        <span>Quantified Self</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setActiveApp('settings'))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>System Core</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
