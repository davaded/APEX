"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal, Wifi } from "lucide-react";

export function ConsoleBlock() {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Simulate boot sequence
        const bootSequence = [
            "APEX Kernel v2.0.0 initializing...",
            "Loading neural modules...",
            "Connecting to Supabase Vector Store...",
            "System Online.",
            "Listening for incoming signals..."
        ];

        let delay = 0;
        bootSequence.forEach((log) => {
            setTimeout(() => {
                addLog(log);
            }, delay);
            delay += Math.random() * 500 + 200;
        });

        // Simulate random activity
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const actions = [
                    "Indexing tweet batch #492...",
                    "Optimizing vector embeddings...",
                    "Garbage collection started...",
                    "Syncing with chrome extension...",
                    "Heartbeat signal received."
                ];
                addLog(actions[Math.floor(Math.random() * actions.length)]);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev].slice(0, 50));
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-64 bg-black/40 backdrop-blur-md rounded-3xl border border-emerald-500/30 p-4 flex flex-col overflow-hidden relative group shadow-lg shadow-emerald-900/10"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-mono text-emerald-500/80 uppercase tracking-wider">
                        Apex Console
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <Wifi className="w-3 h-3 text-zinc-500" />
                </div>
            </div>

            {/* Logs */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-hidden font-mono text-[10px] leading-relaxed text-zinc-400 space-y-1 mask-image-b"
            >
                {logs.map((log, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="truncate"
                    >
                        <span className="text-zinc-600 mr-2">{log.split("]")[0]}]</span>
                        <span className={log.includes("Error") ? "text-red-400" : "text-emerald-500/80"}>
                            {log.split("]")[1]}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    );
}
