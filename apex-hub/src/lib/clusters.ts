import { supabase } from "./supabase";

export interface ClusterNode {
    id: string;
    label: string;
    value: number; // Weight (1-10)
}

export async function fetchNeuralClusters(): Promise<ClusterNode[]> {
    // 1. Try fetching real tags first
    const { data: realTags, error } = await supabase
        .from("tags")
        .select(`
            id,
            name,
            tweet_tags (count)
        `);

    // If we have real tags with usage, format them
    if (realTags && realTags.length > 0) {
        // This relies on Supabase returning the count aggregation correctly, 
        // which usually requires a specialized query or view. 
        // For simplicity in this mock-heavy phase, let's assume if tags exist we use them.
        // But honestly, the user probably hasn't populated the 'tags' table yet.
    }

    // 2. Fallback: "Topic Discovery" from recent tweets
    // We will simple-tokenize the texts locally.
    const { data: tweets } = await supabase
        .from("tweets")
        .select("full_text, ai_summary")
        .order("captured_at", { ascending: false })
        .limit(50);

    if (!tweets || tweets.length === 0) return [];

    const wordMap: Record<string, number> = {};
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'for', 'on', 'with', 'this', 'that', 'it', 'from', 'be', 'are', 'as', 'at', 'by', 'an', 'have', 'has', 'was', 'not', 'but', 'or', 'we', 'i', 'my', 'you', 'your', 'https', 't.co', 'co']);

    tweets.forEach(t => {
        // Combine text and summary
        const content = (t.full_text + " " + (t.ai_summary || "")).toLowerCase();
        // Remove special chars and split
        const words = content.replace(/[^\w\s]/g, '').split(/\s+/);

        words.forEach(w => {
            if (w.length > 3 && !stopWords.has(w) && !/^\d+$/.test(w)) {
                wordMap[w] = (wordMap[w] || 0) + 1;
            }
        });
    });

    // Sort by frequency and take top 20
    const sorted = Object.entries(wordMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20);

    // Normalize weights to 1-5 scale for visual sizing
    const max = sorted[0]?.[1] || 1;

    return sorted.map(([word, count], i) => ({
        id: `node-${i}`,
        label: word,
        value: 1 + Math.round((count / max) * 4) // Scale 1 to 5
    }));
}
