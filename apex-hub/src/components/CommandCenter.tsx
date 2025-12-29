"use client";

import * as React from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Search, Hash, User, FileText, Sparkles } from "lucide-react";

export function CommandCenter() {
    const [open, setOpen] = React.useState(false);

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

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Semantic Search">
                    <CommandItem>
                        <Sparkles className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>Search for "React State Management"</span>
                    </CommandItem>
                    <CommandItem>
                        <Sparkles className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>Find inspiration for "Dark Mode UI"</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Navigation">
                    <CommandItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Timeline</span>
                    </CommandItem>
                    <CommandItem>
                        <Hash className="mr-2 h-4 w-4" />
                        <span>Tags</span>
                    </CommandItem>
                    <CommandItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
