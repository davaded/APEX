import { openDB, type DBSchema } from "idb"
import type { ParsedTweet } from "./utils/parser"

// --- Miner State (Chrome Storage) ---

export type MinerStatus = 'IDLE' | 'SYNCING' | 'COOLDOWN' | 'OFFLINE';

export interface MinerConfig {
    userId: string;
    authorization: string;
    csrfToken: string;
    userAgent: string;
    url?: string; // To capture the endpoint structure
}

export interface MinerState {
    status: MinerStatus;
    config: MinerConfig | null;
    cursors: {
        likes: string;
        bookmarks: string;
    };
    stats: {
        totalCaptured: number;
        lastRunAt: number;
        consecutiveErrors: number;
    };
    cooldownUntil: number;
}

const DEFAULT_STATE: MinerState = {
    status: 'OFFLINE',
    config: null,
    cursors: { likes: "", bookmarks: "" },
    stats: { totalCaptured: 0, lastRunAt: 0, consecutiveErrors: 0 },
    cooldownUntil: 0
};

export async function getMinerState(): Promise<MinerState> {
    const { miner_state } = await chrome.storage.local.get("miner_state");
    return (miner_state as MinerState) || DEFAULT_STATE;
}

export async function updateMinerState(updates: Partial<MinerState>) {
    const current = await getMinerState();
    const newState = { ...current, ...updates };
    await chrome.storage.local.set({ "miner_state": newState });
    return newState;
}

export async function resetMinerState() {
    await chrome.storage.local.set({ "miner_state": DEFAULT_STATE });
}

// --- Data Buffer (IndexedDB) ---

interface ApexDB extends DBSchema {
    pending_tweets: {
        key: number
        value: {
            id?: number
            tweet_id: string
            data: ParsedTweet
            timestamp: number
            synced: number // 0 = false, 1 = true
        }
        indexes: {
            "by-tweet-id": string
            "by-synced": number
        }
    }
}

const DB_NAME = "apex-cache"
const DB_VERSION = 2

export async function initDB() {
    return openDB<ApexDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            if (!db.objectStoreNames.contains("pending_tweets")) {
                const store = db.createObjectStore("pending_tweets", {
                    keyPath: "id",
                    autoIncrement: true,
                })
                store.createIndex("by-tweet-id", "tweet_id", { unique: true })
            }
            if (oldVersion < 2) {
                const store = transaction.objectStore("pending_tweets");
                if (!store.indexNames.contains("by-synced")) {
                    store.createIndex("by-synced", "synced");
                }
            }
        },
    })
}

export async function hasTweet(tweetId: string): Promise<boolean> {
    try {
        const db = await initDB();
        const existing = await db.getFromIndex("pending_tweets", "by-tweet-id", tweetId);
        return !!existing;
    } catch (e) {
        return false;
    }
}

export async function saveTweet(tweetData: ParsedTweet) {
    try {
        console.log("[APEX Storage] Saving tweet:", tweetData.tweet_id);
        const db = await initDB()
        if (await hasTweet(tweetData.tweet_id)) {
            console.log("[APEX Storage] Tweet already exists:", tweetData.tweet_id);
            return;
        }

        await db.add("pending_tweets", {
            tweet_id: tweetData.tweet_id,
            data: tweetData,
            timestamp: Date.now(),
            synced: 0,
        })
        console.log("[APEX Storage] Tweet saved successfully:", tweetData.tweet_id);
    } catch (e) {
        console.error("[APEX] DB Save Error:", e)
    }
}

export async function getPendingTweets(limit = 10) {
    const db = await initDB();
    const tx = db.transaction("pending_tweets", "readonly");
    const index = tx.store.index("by-synced");
    const allPending = await index.getAll(0);
    return allPending.slice(0, limit);
}

export async function markAsSynced(tweetIds: string[]) {
    const db = await initDB();
    const tx = db.transaction("pending_tweets", "readwrite");
    const index = tx.store.index("by-tweet-id");

    for (const id of tweetIds) {
        const record = await index.get(id);
        if (record) {
            record.synced = 1;
            await tx.store.put(record);
        }
    }
    await tx.done;
}

