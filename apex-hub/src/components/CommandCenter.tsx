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
import { Search, Hash, User, FileText, Sparkles, LayoutGrid, Clock, BarChart2, Settings } from "lucide-react";

interface SearchResult {
    tweet_id: string;
    full_text: string;
    user_name: string;
}

export function CommandCenter() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
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
        const timer = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            const { data } = await supabase
                .from("tweets")
                .select("tweet_id, full_text, user_name")
                .ilike("full_text", `%${query}%`)
                .limit(5);

            if (data) {
                setResults(data);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Type a command or search..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {query.length > 0 && (
                    <CommandGroup heading="Search Results">
                        {results.map((result) => (
                            <CommandItem
                                key={result.tweet_id}
                                onSelect={() => runCommand(() => router.push(`/tweet/${result.tweet_id}`))}
                                className="cursor-pointer"
                            >
                                <FileText className="mr-2 h-4 w-4 text-emerald-500" />
                                <span className="truncate">
                                    <span className="font-semibold mr-2 text-zinc-300">{result.user_name}:</span>
                                    <span className="text-zinc-400">{result.full_text}</span>
                                </span>
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
