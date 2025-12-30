import { supabase } from "./supabase";
import { subDays, format, isAfter } from "date-fns";

export interface QuantifiedStats {
    totalTweets: number;
    velocityScores: number[]; // Last 7 days counts
    topAuthors: { name: string; count: number; avatar: string }[];
    mediaDiet: {
        textOnly: number; // percentage
        visual: number;   // percentage
    };
    weekOverWeek: number; // Percentage growth/decline
}

export async function fetchQuantifiedStats(): Promise<QuantifiedStats> {
    // 1. Fetch all tweets (for MVP this is fine, for scale use specific RPCs)
    const { data: tweets, error } = await supabase
        .from("tweets")
        .select("id, captured_at, user_name, user_avatar_url, media_urls");

    if (!tweets || error) {
        return {
            totalTweets: 0,
            velocityScores: [0, 0, 0, 0, 0, 0, 0],
            topAuthors: [],
            mediaDiet: { textOnly: 0, visual: 0 },
            weekOverWeek: 0
        };
    }

    // --- A. Total ---
    const totalTweets = tweets.length;

    // --- B. Velocity (Last 7 Days) ---
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, 6 - i); // 6 days ago to today
        return { date: d, count: 0 };
    });

    const oneWeekAgo = subDays(today, 7);
    const twoWeeksAgo = subDays(today, 14);

    let currentWeekCount = 0;
    let lastWeekCount = 0;

    tweets.forEach(t => {
        if (!t.captured_at) return;
        const captured = new Date(t.captured_at);

        // Velocity Chart
        last7Days.forEach(day => {
            if (format(captured, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd')) {
                day.count++;
            }
        });

        // WoW Calculation
        if (isAfter(captured, oneWeekAgo)) {
            currentWeekCount++;
        } else if (isAfter(captured, twoWeeksAgo)) {
            lastWeekCount++;
        }
    });

    const velocityScores = last7Days.map(d => d.count);

    // WoW
    const weekOverWeek = lastWeekCount === 0
        ? currentWeekCount * 100
        : Math.round(((currentWeekCount - lastWeekCount) / lastWeekCount) * 100);


    // --- C. Top Authors ---
    const authorMap: Record<string, { count: number, avatar: string }> = {};
    tweets.forEach(t => {
        if (!t.user_name) return;
        if (!authorMap[t.user_name]) {
            authorMap[t.user_name] = { count: 0, avatar: t.user_avatar_url || '' };
        }
        authorMap[t.user_name].count++;
    });

    const topAuthors = Object.entries(authorMap)
        .map(([name, data]) => ({ name, count: data.count, avatar: data.avatar }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);


    // --- D. Media Diet ---
    let visualCount = 0;
    tweets.forEach(t => {
        if (t.media_urls && Array.isArray(t.media_urls) && t.media_urls.length > 0) {
            visualCount++;
        }
    });

    const visualPct = totalTweets === 0 ? 0 : Math.round((visualCount / totalTweets) * 100);
    const textPct = 100 - visualPct;

    return {
        totalTweets,
        velocityScores,
        topAuthors,
        mediaDiet: {
            textOnly: textPct,
            visual: visualPct
        },
        weekOverWeek
    };
}
