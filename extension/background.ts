import { createClient } from "@supabase/supabase-js";
import { getMinerState, updateMinerState, saveTweet, getPendingTweets, markAsSynced, type MinerState } from "./storage";
import { parseTimeline } from "./utils/parser";

const ALARM_NAME = "apex_miner_tick";
const BASE_DELAY_MS = 3 * 60 * 1000; // 3 min
const JITTER_MAX_MS = 1 * 60 * 1000; // 1 min

// Initialize Supabase (use env variables)
const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 1. Alarm Listener
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAME) {
        await runMinerCycle();
    }
});

// Initial run on extension load
runMinerCycle();

// 2. Message Listener (Auth Updates)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[APEX Background] Message received:", message.type);

    if (message.type === "MINER_AUTH_UPDATE") {
        console.log("[APEX Background] Processing MINER_AUTH_UPDATE...");
        console.log("[APEX Background] Payload URL:", message.payload?.url?.substring(0, 50) + "...");

        updateMinerState({
            status: 'IDLE',
            config: message.payload,
            cooldownUntil: 0
        }).then(() => {
            console.log("[APEX Background] State updated to IDLE. Scheduling immediate run...");
            scheduleNextRun(1000);
            sendResponse({ success: true });
        });
        return true;
    }

    if (message.type === "APEX_TRIGGER_SYNC") {
        console.log("[APEX Background] Manual sync triggered");
        syncPendingTweets().then(() => {
            sendResponse({ success: true });
        });
        return true;
    }

    return false;
});

// --- Core Miner Logic ---

async function scheduleNextRun(delayOverride?: number) {
    const delay = delayOverride ?? (BASE_DELAY_MS + Math.random() * JITTER_MAX_MS);
    const when = Date.now() + delay;

    console.log(`[APEX Miner] Next run in ${Math.round(delay / 1000)}s`);
    await chrome.alarms.create(ALARM_NAME, { when });
}

async function runMinerCycle() {
    console.log("[APEX Miner] === Cycle Start ===");
    try {
        const state = await getMinerState();
        console.log("[APEX Miner] Current State:", {
            status: state.status,
            hasConfig: !!state.config,
            hasAuth: !!state.config?.authorization,
            hasUrl: !!state.config?.url
        });

        // 1. Check Circuit Breaker
        if (Date.now() < state.cooldownUntil) {
            console.log(`[APEX Miner] Cooling down`);
            await updateMinerState({ status: 'COOLDOWN' });
            scheduleNextRun();
            return;
        }

        // 2. Check Auth
        if (!state.config || !state.config.authorization) {
            console.log("[APEX Miner] Offline: No Auth.");
            await updateMinerState({ status: 'OFFLINE' });
            return;
        }

        // 2.5. Check URL
        if (!state.config.url) {
            console.log("[APEX Miner] Has auth but no URL.");
            return;
        }

        // 3. Stealth Check (User Active?)
        const idleState = await new Promise<string>(resolve => chrome.idle.queryState(60, resolve));
        if (idleState === 'locked') {
            console.log("[APEX Miner] User inactive. Skipping.");
            await updateMinerState({ status: 'IDLE' });
            scheduleNextRun();
            return;
        }

        // 4. Execute Mine
        await updateMinerState({ status: 'SYNCING' });
        await mine(state);

        // 5. Sync Buffer to Supabase
        await syncPendingTweets();

    } catch (e) {
        console.error("[APEX Miner] Cycle Error:", e);
    } finally {
        const finalState = await getMinerState();
        if (finalState.status !== 'OFFLINE') {
            scheduleNextRun();
        }
    }
}

async function mine(state: MinerState) {
    if (!state.config || !state.config.url) return;

    try {
        console.log("[APEX Miner] Mining...");

        // Construct URL
        const urlObj = new URL(state.config.url);
        const params = new URLSearchParams(urlObj.search);
        const variablesStr = params.get("variables");

        if (variablesStr) {
            const variables = JSON.parse(variablesStr);
            if (state.cursors.likes) {
                variables.cursor = state.cursors.likes;
            }
            params.set("variables", JSON.stringify(variables));
            urlObj.search = params.toString();
        }

        const targetUrl = urlObj.toString();

        const headers: Record<string, string> = {
            "authorization": state.config.authorization,
            "x-csrf-token": state.config.csrfToken,
            "content-type": "application/json"
        };

        if (state.config.userAgent) {
            headers["user-agent"] = state.config.userAgent;
        }

        console.log("[APEX Miner] Sending request...");

        const response = await fetch(targetUrl, {
            headers,
            credentials: 'include'
        });

        console.log("[APEX Miner] Response status:", response.status);

        if (response.status === 429) {
            console.warn("[APEX Miner] Rate Limited. Cooling down.");
            await updateMinerState({
                status: 'COOLDOWN',
                cooldownUntil: Date.now() + 12 * 60 * 60 * 1000
            });
            return;
        }

        if (response.status === 401 || response.status === 403) {
            console.warn("[APEX Miner] Auth Invalid.");
            await updateMinerState({ status: 'OFFLINE' });
            return;
        }

        if (!response.ok) {
            console.error(`[APEX Miner] HTTP Error: ${response.status}`);
            return;
        }

        const rawData = await response.json();

        const action = targetUrl.includes("Likes") ? "likes_timeline" : "bookmarks_timeline";
        const tweets = parseTimeline(rawData, action);

        if (tweets.length > 0) {
            console.log(`[APEX Miner] Captured ${tweets.length} tweets`);
            for (const tweet of tweets) {
                await saveTweet(tweet);
            }
        }

        // Extract Next Cursor
        let nextCursor: string | undefined;
        try {
            const instructions = rawData?.data?.user?.result?.timeline?.timeline?.instructions ||
                rawData?.data?.user?.result?.timeline_v2?.timeline?.instructions;

            if (instructions) {
                for (const instr of instructions) {
                    if (instr.type === "TimelineAddEntries" && instr.entries) {
                        const bottom = instr.entries.find((e: any) => e.entryId.includes("cursor-bottom"));
                        if (bottom) {
                            nextCursor = bottom.content?.itemContent?.value || bottom.content?.value;
                        }
                    }
                }
            }
        } catch (e) { }

        if (nextCursor) {
            await updateMinerState({
                status: 'IDLE',
                cursors: { ...state.cursors, likes: nextCursor },
                stats: {
                    ...state.stats,
                    lastRunAt: Date.now(),
                    totalCaptured: state.stats.totalCaptured + tweets.length
                }
            });
        }

    } catch (e) {
        console.error("[APEX Miner] Mine Error:", e);
    }
}

// --- Sync Logic ---

async function syncPendingTweets() {
    try {
        const pending = await getPendingTweets(50);
        if (pending.length === 0) return;

        console.log(`[APEX Background] Syncing ${pending.length} tweets...`);

        // Transform ParsedTweet to match database schema
        const records = pending.map(p => ({
            tweet_id: p.data.tweet_id,
            tweet_url: p.data.tweet_url,
            full_text: p.data.full_text,
            user_name: p.data.user_name,
            user_screen_name: p.data.user_screen_name,
            user_avatar_url: p.data.user_avatar, // Mapped to Correct DB Column
            media_urls: p.data.media_urls,
            video_url: p.data.video_url || null,
            tweet_created_at: p.data.created_at,
            metrics: p.data.metrics,
            is_quoted: p.data.is_quoted || false,
            source: p.data.source,
            captured_at: p.data.captured_at
        }));

        const { error } = await supabase
            .from('tweets')
            .upsert(records, { onConflict: 'tweet_id' });

        if (error) {
            console.error("[APEX Background] Sync failed:", error);
        } else {
            console.log("[APEX Background] Sync success");
            const ids = pending.map(p => p.tweet_id);
            await markAsSynced(ids);
        }
    } catch (e) {
        console.error("[APEX Background] Sync error:", e);
    }
}
