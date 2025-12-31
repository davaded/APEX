import { supabase } from "@/lib/supabase";
import { ArrowLeft, Share2, Sparkles, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SideCard } from "@/components/SideCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { TweetAnalysisControl } from "@/components/TweetAnalysisControl";

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";

async function getTweet(id: string) {
    // If id is actually the tweet_id (numeric string) or UUID.
    // The prompt URL says /tweet/[id]. Users link with tweet.tweet_id usually.
    // Let's try to query by both just in case, or assume passed param is tweet_id if numeric, else UUID.
    // But supabase `id` is UUID, `tweet_id` is X's ID.
    // The link in TweetDrawer was: href={`/tweet/${tweet.tweet_id}`}
    // So we should query by tweet_id first.

    // Safety check for empty ID
    if (!id) return null;

    const { data, error } = await supabase
        .from("tweets")
        .select("*")
        .eq("tweet_id", id) // Try matching Twitter ID first
        .single();

    if (data) return data;

    // Fallback: try UUID
    const { data: dataUuid } = await supabase
        .from("tweets")
        .select("*")
        .eq("id", id)
        .single();

    return dataUuid || null;
}

export default async function TweetFocusPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tweet = await getTweet(id);

    if (!tweet) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500">
                Tweet not found.
            </div>
        );
    }

    // Extract Title for layout (first sentence or default)
    const title = tweet.full_text?.split(/[.!?\n]/).filter(Boolean)[0] || "Untitled Tweet";
    const body = tweet.full_text?.replace(title, "").trim() || "";
    // Simplified Mock for AI Summary if column missing
    const aiSummary = tweet.ai_summary || null; // Support DB column if exists

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-200 selection:bg-emerald-500/30">
            {/* 1. Header (Sticky) */}
            <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 px-8 py-4 backdrop-blur-md">
                <Link
                    href="/"
                    className="group flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    <span>Back to Grid</span>
                </Link>
                <div className="flex gap-4">
                    <button className="rounded-full bg-white/5 p-3 text-zinc-400 hover:bg-white/10 hover:text-white transition-all">
                        <Share2 size={18} />
                    </button>
                </div>
            </nav>

            <main className="mx-auto grid max-w-[1600px] grid-cols-12 gap-12 px-8 py-12">
                {/* === Left: AI Outline (Sticky) === */}
                <aside className="col-span-2 hidden lg:block">
                    <div className="sticky top-32 space-y-8">
                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                            Key Insights
                        </div>
                        <ul className="space-y-4 border-l border-white/10 pl-4">
                            {['Context Analysis', 'Core Argument', 'Implications'].map((item) => (
                                <li
                                    key={item}
                                    className="cursor-pointer text-sm text-zinc-500 hover:text-emerald-400 hover:border-emerald-500 -ml-[17px] border-l-2 border-transparent pl-4 transition-all"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* === Center: Content (The Stage) === */}
                <article className="col-span-12 lg:col-span-7">
                    {/* Hero Image */}
                    {tweet.media_urls && tweet.media_urls.length > 0 && (
                        <div className="mb-12 overflow-hidden rounded-3xl border border-white/5 bg-[#121212] relative aspect-[21/9]">
                            <Image
                                src={tweet.media_urls[0]}
                                alt="Hero"
                                fill
                                className="object-cover brightness-90"
                            />
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="mb-6 font-serif text-4xl md:text-5xl leading-tight text-white">
                        {title}
                    </h1>

                    {/* AI Analysis Control */}
                    <TweetAnalysisControl
                        tweetId={tweet.tweet_id}
                        fullText={tweet.full_text}
                        initialSummary={aiSummary}
                    // Note: We need to fetch tags if we want to show them initially. 
                    // For now, we'll just pass empty array or fetch them in getTweet if we update the query.
                    // Assuming tags are not yet joined in the getTweet query for simplicity.
                    />

                    {/* Main Text */}
                    <div className="prose prose-invert prose-lg max-w-none text-zinc-300 font-light leading-9 font-sans whitespace-pre-wrap">
                        {aiSummary ? tweet.full_text : body || tweet.full_text}
                    </div>

                    {/* External Links */}
                    {tweet.urls && tweet.urls.length > 0 && (
                        <div className="mt-12 flex flex-col gap-3 not-prose">
                            {tweet.urls.map((url: string, i: number) => (
                                <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-sm text-emerald-500/80 hover:text-emerald-400 transition-colors p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10"
                                >
                                    <ExternalLink size={16} />
                                    <span className="truncate font-mono">{url}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </article>

                {/* === Right: Context (Sidebar) === */}
                <aside className="col-span-12 lg:col-span-3 space-y-12">
                    {/* Author Card */}
                    <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 ring-1 ring-white/10">
                                {tweet.user_avatar_url ? (
                                    <Image
                                        src={tweet.user_avatar_url}
                                        alt={tweet.user_name || "User"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                                        {tweet.user_name?.[0] || "?"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-white text-lg">{tweet.user_name}</div>
                                <div className="text-sm text-zinc-500">@{tweet.user_screen_name}</div>
                            </div>
                        </div>
                        <a
                            href={`https://twitter.com/${tweet.user_screen_name}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full text-center rounded-lg bg-white/5 py-2 text-sm font-medium hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                        >
                            View Profile on X
                        </a>
                        <div className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-600 font-mono text-center">
                            Captured {tweet.captured_at ? formatDistanceToNow(new Date(tweet.captured_at)) : ''} ago
                        </div>
                    </div>

                    {/* Related Knowledge */}
                    <div>
                        <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-zinc-600">
                            Related Knowledge
                        </h3>
                        <div className="flex flex-col gap-4">
                            <SideCard />
                            <SideCard />
                            <SideCard />
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
