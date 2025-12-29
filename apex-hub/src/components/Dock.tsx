"use client";

import { motion } from "framer-motion";
import { LayoutGrid, Clock, Tag, BarChart2, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Dock() {
    const [activeTab, setActiveTab] = useState("timeline");

    const navItems = [
        { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
        { id: "timeline", icon: Clock, label: "Timeline" },
        { id: "tags", icon: Tag, label: "Tags" },
        { id: "analytics", icon: BarChart2, label: "Analytics" },
    ];

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-8"
        >
            <div className="flex flex-col items-center gap-6 p-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "relative p-3 rounded-full transition-all duration-300 group",
                                isActive ? "text-emerald-400 bg-white/10" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                            )}
                        >
                            <item.icon className="w-5 h-5" />

                            {/* Tooltip */}
                            <span className="absolute left-full ml-4 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="active-dock-indicator"
                                    className="absolute inset-0 rounded-full border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}

                <div className="w-8 h-px bg-white/10 my-2" />

                <button className="p-3 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all">
                    <Settings className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all">
                    <User className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
