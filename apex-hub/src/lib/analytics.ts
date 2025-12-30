import { supabase } from "./supabase";

export interface ActivityData {
    date: string;
    count: number;
}

export async function fetchActivityHeatmap(): Promise<ActivityData[]> {
    // 1. Fetch all tweet timestamps
    // Optimization: In a real app with millions of rows, use a simpler count query or RPC.
    // For now, selecting 'captured_at' for all rows is fine for thousands of items.
    const { data, error } = await supabase
        .from("tweets")
        .select("captured_at");

    if (error) {
        console.error("Error fetching activity:", error);
        return [];
    }

    if (!data) return [];

    // 2. Aggregate locally
    const activityMap: Record<string, number> = {};

    data.forEach((row) => {
        if (!row.captured_at) return;
        // Format: YYYY-MM-DD
        const date = new Date(row.captured_at).toISOString().split('T')[0];
        activityMap[date] = (activityMap[date] || 0) + 1;
    });

    // 3. Convert to array
    return Object.entries(activityMap).map(([date, count]) => ({
        date,
        count
    }));
}
