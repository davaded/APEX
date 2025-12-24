import { openDB, type DBSchema } from "idb"

interface ApexDB extends DBSchema {
    pending_tweets: {
        key: number
        value: {
            tweet_id: string
            data: any
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

export async function saveTweet(tweetData: any) {
    try {
        const db = await initDB()

        // Extract Tweet ID (simplified logic, needs refinement based on actual X data structure)
        // Usually in result.rest_id or similar
        const tweetId = tweetData?.rest_id || tweetData?.tweet?.rest_id || Date.now().toString()

        await db.add("pending_tweets", {
            tweet_id: tweetId,
            data: tweetData,
            timestamp: Date.now(),
            synced: false,
        })
        console.log("[APEX] Saved to DB:", tweetId)
    } catch (e) {
        console.error("[APEX] DB Save Error:", e)
    }
}
