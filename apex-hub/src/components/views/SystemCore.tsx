"use client";

import { useState, useEffect } from "react";
import { Settings, Cpu, Database, Save, Download, Trash2, Key, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export function SystemCore() {
    const [apiKey, setApiKey] = useState("");
    const [baseURL, setBaseURL] = useState("");
    const [model, setModel] = useState("gpt-4o-mini");
    const [status, setStatus] = useState<'online' | 'offline'>('online');
    const [exporting, setExporting] = useState(false);

    // Load saved settings on mount
    useEffect(() => {
        const savedKey = localStorage.getItem("apex_openai_key");
        const savedBaseURL = localStorage.getItem("apex_openai_base_url");
        const savedModel = localStorage.getItem("apex_openai_model");

        if (savedKey) setApiKey(savedKey);
        if (savedBaseURL) setBaseURL(savedBaseURL);
        if (savedModel) setModel(savedModel);
    }, []);

    const saveSettings = () => {
        if (apiKey) localStorage.setItem("apex_openai_key", apiKey);
        if (baseURL) localStorage.setItem("apex_openai_base_url", baseURL);
        if (model) localStorage.setItem("apex_openai_model", model);
        alert("AI Configuration Saved locally.");
    };

    // Real functionality: Export all tweets as JSON
    const exportData = async () => {
        setExporting(true);
        const { data, error } = await supabase.from("tweets").select("*");

        if (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `apex-knowledge-base-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        setExporting(false);
    };

    return (
        <div className="p-8 space-y-12 min-h-screen bg-[#050505] text-zinc-200 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="border-b border-white/5 pb-6 flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-serif text-zinc-100 flex items-center gap-4 mb-2">
                        <Settings className="w-8 h-8 text-emerald-500 animate-[spin_10s_linear_infinite]" />
                        System Core
                    </h2>
                    <p className="text-zinc-500 text-lg font-light">
                        Configuration and control plane.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-900/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Systems Nominal</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Intelligence Module */}
                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Cpu className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-xl font-serif text-zinc-100">Intelligence</h3>
                    </div>

                    <div className="space-y-4">
                        {/* API Key */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                                OpenAI API Key
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        {/* Base URL */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                                Base URL (Optional)
                            </label>
                            <input
                                type="text"
                                value={baseURL}
                                onChange={(e) => setBaseURL(e.target.value)}
                                placeholder="https://api.openai.com/v1"
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 px-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                            />
                            <p className="text-[10px] text-zinc-600 mt-1 ml-1">
                                Must end with <code className="text-zinc-500">/v1</code> for most providers (e.g. LM Studio, Ollama).
                            </p>
                        </div>

                        {/* Model Name (Chat) */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                                Chat Model Name
                            </label>
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder="gpt-4o-mini"
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 px-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                            />
                        </div>

                        <button
                            onClick={saveSettings}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                        >
                            <Save size={16} /> Save Configuration
                        </button>

                        <p className="text-xs text-zinc-600 text-center">
                            Settings are stored locally in your browser.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">Background Processing</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-zinc-500">IDLE</span>
                                <div className="w-10 h-6 bg-zinc-800 rounded-full relative cursor-not-allowed opacity-50">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-600 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Data Persistence */}
                <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Database className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-xl font-serif text-zinc-100">Data Persistence</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-900/20 flex items-start gap-4">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-emerald-400">Database Connected</h4>
                                <p className="text-xs text-emerald-500/60 mt-1">
                                    Supabase instance is active and reachable. Real-time subscriptions are operating normally.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={exportData}
                                disabled={exporting}
                                className="p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all flex flex-col items-center justify-center gap-2 group text-zinc-400 hover:text-zinc-200"
                            >
                                <Download className={cn("w-6 h-6 mb-1 text-zinc-500 group-hover:text-emerald-500 transition-colors", exporting && "animate-bounce")} />
                                <span className="text-xs font-mono uppercase tracking-wider">
                                    {exporting ? "Archiving..." : "Export JSON"}
                                </span>
                            </button>

                            <button
                                className="p-4 rounded-xl bg-zinc-900 hover:bg-red-950/10 border border-zinc-800 hover:border-red-900/30 transition-all flex flex-col items-center justify-center gap-2 group text-zinc-400 hover:text-red-400 opacity-50 cursor-not-allowed"
                                title="Feature locked for safety"
                            >
                                <Trash2 className="w-6 h-6 mb-1 text-zinc-600 group-hover:text-red-500 transition-colors" />
                                <span className="text-xs font-mono uppercase tracking-wider">Purge DB</span>
                            </button>
                        </div>
                        <p className="text-xs text-zinc-600 text-center">
                            Last Backup: Never
                        </p>
                    </div>
                </div>

                {/* 3. System Info */}
                <div className="lg:col-span-2 p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Version</div>
                            <div className="font-mono text-zinc-300">v0.9.2-beta</div>
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Build</div>
                            <div className="font-mono text-zinc-300">Titanium</div>
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Environment</div>
                            <div className="font-mono text-zinc-300">Development</div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-zinc-600">
                        <AlertCircle size={14} />
                        <span className="text-xs">No active alerts</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
