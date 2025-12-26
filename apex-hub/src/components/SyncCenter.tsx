"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Database, Cpu, HardDrive, Activity, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface SyncCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SyncCenter({ isOpen, onClose }: SyncCenterProps) {
    const [progress, setProgress] = useState(0);

    // Simulate live progress
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setProgress(p => (p + 1) % 100);
        }, 100);
        return () => clearInterval(interval);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
                    />

                    {/* Main Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 md:inset-20 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl z-[90] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <Activity className="text-emerald-500" />
                                <h2 className="text-lg font-bold tracking-wide text-zinc-100">SYNC CENTER</h2>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-mono border border-emerald-500/20 animate-pulse">
                                    ONLINE
                                </span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                                <X className="text-zinc-500" />
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto">

                            {/* Left Col: Live Pipeline */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Pipeline Visualizer */}
                                <div className="bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
                                    <h3 className="text-sm font-medium text-zinc-400 mb-6 uppercase tracking-wider">Data Pipeline</h3>
                                    <div className="flex items-center justify-between relative">
                                        {/* Connecting Line */}
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10" />

                                        <PipelineNode icon={Database} label="Miner" status="active" />
                                        <PipelineStream active={true} />
                                        <PipelineNode icon={Cpu} label="Processor" status="processing" />
                                        <PipelineStream active={true} />
                                        <PipelineNode icon={HardDrive} label="Vector DB" status="idle" />
                                    </div>

                                    {/* Live Log */}
                                    <div className="mt-8 font-mono text-xs text-zinc-500 bg-black/40 p-4 rounded-lg border border-zinc-800 h-32 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />
                                        <div className="space-y-1">
                                            <div className="text-emerald-500/80">[15:42:01] Captured tweet 1872... from @user</div>
                                            <div className="text-zinc-500">[15:42:02] Parsing media entities...</div>
                                            <div className="text-blue-400/80">[15:42:02] Generating embedding (1536 dim)...</div>
                                            <div className="text-zinc-500">[15:42:03] Syncing to Supabase...</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Collection History */}
                                <div className="bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
                                    <h3 className="text-sm font-medium text-zinc-400 mb-6 uppercase tracking-wider">History Line</h3>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-800">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <div className="flex-1">
                                                    <div className="text-sm text-zinc-200 font-medium">Batch Auto-Sync #{1024 - i}</div>
                                                    <div className="text-xs text-zinc-500">Captured 45 items • 2 mins ago</div>
                                                </div>
                                                <div className="text-xs font-mono text-zinc-600">SUCCESS</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Stats */}
                            <div className="space-y-6">
                                <StatCard label="Total Tweets" value="12,450" change="+124 today" />
                                <StatCard label="Storage Used" value="450 MB" change="Vector Index" />
                                <StatCard label="AI Tokens" value="1.2M" change="GPT-4o" />

                                {/* Progress Circle */}
                                <div className="bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50 flex flex-col items-center justify-center text-center">
                                    <div className="relative w-32 h-32 mb-4">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-500 transition-all duration-300" strokeDasharray={377} strokeDashoffset={377 - (377 * progress) / 100} />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-bold text-white">{progress}%</span>
                                            <span className="text-[10px] text-zinc-500 uppercase">Indexing</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-zinc-400">Current Batch Processing</div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function PipelineNode({ icon: Icon, label, status }: { icon: any, label: string, status: 'active' | 'processing' | 'idle' }) {
    const isActive = status === 'active' || status === 'processing';
    return (
        <div className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${isActive ? 'bg-zinc-900 border-emerald-500 text-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                }`}>
                <Icon size={20} className={status === 'processing' ? 'animate-pulse' : ''} />
            </div>
            <span className={`text-xs font-medium ${isActive ? 'text-zinc-200' : 'text-zinc-600'}`}>{label}</span>
        </div>
    );
}

function PipelineStream({ active }: { active: boolean }) {
    return (
        <div className="flex-1 h-0.5 bg-zinc-800 relative overflow-hidden">
            {active && (
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-1/2"
                />
            )}
        </div>
    );
}

function StatCard({ label, value, change }: { label: string, value: string, change: string }) {
    return (
        <div className="bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
            <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
            <div className="text-2xl font-bold text-zinc-100 mb-2">{value}</div>
            <div className="text-xs text-emerald-500 flex items-center gap-1">
                <CheckCircle2 size={12} />
                {change}
            </div>
        </div>
    );
}
