"use client";

import { motion } from "framer-motion";
import { LayoutGrid, Search, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SyncCenter } from "./SyncCenter";

export function ApexBar() {
    const [isSyncOpen, setIsSyncOpen] = useState(false);

    return (
        <>
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={cn(
                        "h-14 px-2 rounded-full flex items-center gap-4",
                        "bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50",
                        "shadow-2xl shadow-zinc-950/50"
                    )}
                >
                    {/* Left Zone: Navigation */}
                    <div className="flex items-center gap-1 pl-2">
                        <IconButton icon={LayoutGrid} tooltip="Gallery" active />
                        <IconButton icon={Search} tooltip="Search" />
                        <IconButton
                            icon={Activity}
                            tooltip="Sync Center"
                            onClick={() => setIsSyncOpen(true)}
                            active={isSyncOpen}
                        />
                    </div>

                    {/* Center Zone: Pulse Monitor */}
                    <div className="hidden md:flex items-center justify-center w-64 h-8 bg-black/20 rounded-full border border-white/5 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            [System] Apex Core Online
                        </span>
                    </div>

                    {/* Right Zone: Profile */}
                    <div className="flex items-center gap-3 pr-2 pl-2 border-l border-white/5">
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-20" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                            <User className="w-4 h-4 text-zinc-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <SyncCenter isOpen={isSyncOpen} onClose={() => setIsSyncOpen(false)} />
        </>
    );
}

function IconButton({ icon: Icon, active, tooltip, onClick }: { icon: any; active?: boolean; tooltip: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-2 rounded-full transition-all duration-200 group relative",
                active ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
        >
            <Icon className="w-5 h-5" />
            {/* Tooltip */}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-zinc-900 text-zinc-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-800">
                {tooltip}
            </span>
        </button>
    );
}
