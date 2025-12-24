import { createClient } from "@supabase/supabase-js"
import type { ParsedTweet } from "./utils/parser"

// Initialize Supabase Client
const SUPABASE_URL = process.env.PLASMO_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "")

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "APEX_UPLOAD") {
        console.log("[APEX Background] Received upload request:", message.payload.tweet_id)
        handleUpload(message.payload)
    }
})

async function handleUpload(tweet: ParsedTweet) {
    try {
        console.log("[APEX Background] Uploading:", tweet.tweet_id);

        const { error } = await supabase
            .from('tweets')
            .upsert(tweet, { onConflict: 'tweet_id' });

        if (error) {
            console.error("[APEX Background] Upload failed:", error);
        } else {
            console.log("[APEX Background] Upload success:", tweet.tweet_id);
        }
    } catch (e) {
        console.error("[APEX Background] Processing error:", e);
    }
}
