"use client";

import { motion } from "framer-motion";

export function SideCard() {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors p-4 flex flex-col gap-3 cursor-pointer group"
        >
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">
                    Concept
                </span>
            </div>
            <div className="space-y-2">
                <div className="h-2 w-3/4 bg-zinc-800 rounded group-hover:bg-zinc-700 transition-colors" />
                <div className="h-2 w-1/2 bg-zinc-800/50 rounded" />
            </div>
            <div className="pt-2 flex items-center gap-2 border-t border-zinc-800/50">
                <div className="w-4 h-4 rounded-full bg-zinc-800" />
                <div className="h-1.5 w-12 bg-zinc-800 rounded" />
            </div>
        </motion.div>
    );
}
