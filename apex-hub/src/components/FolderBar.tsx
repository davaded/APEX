"use client";

import { motion } from "framer-motion";
import { Folder, Sparkles, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderBarProps {
    isOpen: boolean;
}

export function FolderBar({ isOpen }: FolderBarProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="flex items-center gap-2 p-2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-xl"
            >
                {/* Breadcrumb / Home */}
                <button className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-colors">
                    <Folder className="w-4 h-4" />
                </button>

                <ChevronRight className="w-4 h-4 text-zinc-700" />

                {/* Smart Folders */}
                <div className="flex items-center gap-2">
                    <FolderItem label="Tech Frontier" icon={Sparkles} color="text-purple-400" />
                    <FolderItem label="Design Inspo" icon={Sparkles} color="text-emerald-400" />
                </div>

                <div className="w-px h-4 bg-zinc-800 mx-1" />

                {/* Manual Folders */}
                <div className="flex items-center gap-2">
                    <FolderItem label="Read Later" />
                    <FolderItem label="Archive" />
                </div>

                {/* Add New */}
                <button className="ml-auto p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </motion.div>
        </div>
    );
}

function FolderItem({ label, icon: Icon, color }: { label: string; icon?: any; color?: string }) {
    return (
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all group">
            {Icon && <Icon className={cn("w-3 h-3", color)} />}
            <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">{label}</span>
        </button>
    );
}
