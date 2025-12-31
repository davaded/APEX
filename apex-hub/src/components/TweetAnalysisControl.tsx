"use client";

import { useState } from "react";
import { Sparkles, Loader2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";

interface TweetAnalysisControlProps {
    tweetId: string;
    fullText: string;
    initialSummary?: string | null;
    initialTags?: string[];
}

export function TweetAnalysisControl({ tweetId, fullText, initialSummary, initialTags = [] }: TweetAnalysisControlProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [summary, setSummary] = useState(initialSummary);
    const [tags, setTags] = useState<string[]>(initialTags);
    const router = useRouter();

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            // Get config from localStorage
            const apiKey = localStorage.getItem("apex_openai_key");
            const baseURL = localStorage.getItem("apex_openai_base_url");
            const model = localStorage.getItem("apex_openai_model");

            const response = await fetch('/api/tweet/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-openai-key': apiKey || '',
                    'x-openai-base-url': baseURL || '',
                    'x-openai-model': model || ''
                },
                body: JSON.stringify({ tweetId, text: fullText })
            });

            if (response.ok) {
                const data = await response.json();
                setSummary(data.summary);
                setTags(data.tags || []);
                router.refresh(); // Refresh server data
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Analysis failed:", response.status, response.statusText, errorData);
                alert(`Failed to analyze tweet: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Analysis error:", error);
            alert("An error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (summary) {
        return (
            <div className="my-10 space-y-6">
                {/* Summary Card */}
                <div className="p-8 bg-gradient-to-br from-emerald-950/20 to-black border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-4 flex items-center gap-2 text-emerald-500">
                        <Sparkles size={18} />
                        <span className="text-xs font-bold tracking-widest uppercase">AI Insight</span>
                    </div>
                    <p className="font-serif text-xl italic text-emerald-100/80 leading-relaxed">
                        "{summary}"
                    </p>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                            <div
                                key={i}
                                className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <Tag size={12} />
                                {tag}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="my-10 p-8 border border-white/5 rounded-2xl bg-white/[0.02] flex flex-col items-center justify-center text-center gap-4 group hover:bg-white/[0.04] transition-colors">
            <div className="p-3 rounded-full bg-zinc-900 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-6 h-6 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
            </div>

            <div className="space-y-1">
                <h3 className="text-zinc-200 font-medium">Unlock Neural Insights</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                    Use AI to analyze this tweet, extract key topics, and generate a concise summary.
                </p>
            </div>

            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="mt-2 px-6 py-2 bg-zinc-100 hover:bg-white text-black text-sm font-medium rounded-full transition-all hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isAnalyzing ? (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles size={14} />
                        Analyze Content
                    </>
                )}
            </button>
        </div>
    );
}
