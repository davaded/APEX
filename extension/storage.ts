import { openDB, type DBSchema } from "idb"
import type { ParsedTweet } from "./utils/parser"

interface ApexDB extends DBSchema {
    pending_tweets: {
        key: number
        value: {
            tweet_id: string
            data: ParsedTweet
            timestamp: number
            synced: boolean
        }
        indexes: { "by-tweet-id": string }
    }
}

const DB_NAME = "apex-cache"
const DB_VERSION = 1

export async function initDB() {
    return openDB<ApexDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("pending_tweets")) {
                const store = db.createObjectStore("pending_tweets", {
                    keyPath: "id",
                    autoIncrement: true,
                })
                store.createIndex("by-tweet-id", "tweet_id", { unique: true })
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
        const db = await initDB()

        // Deduplication Check
        if (await hasTweet(tweetData.tweet_id)) {
            console.log("[APEX] Duplicate ignored:", tweetData.tweet_id);
            return;
        }

        await db.add("pending_tweets", {
            tweet_id: tweetData.tweet_id,
            data: tweetData,
            timestamp: Date.now(),
            synced: false,
        })
        console.log("[APEX] Saved to DB:", tweetData.tweet_id)
    } catch (e) {
        console.error("[APEX] DB Save Error:", e)
    }
}
