import { createClient } from "@supabase/supabase-js"

// Initialize Supabase Client (Replace with actual env vars in production build)
// For MVP, we might need to hardcode or use Plasmo env vars
const SUPABASE_URL = process.env.PLASMO_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "")

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "APEX_UPLOAD") {
        console.log("[APEX Background] Received upload request:", message.payload)
        handleUpload(message.payload)
    }
})

async function handleUpload(data: any) {
    try {
        // Extract Tweet ID
        const tweetId = data?.data?.create_tweet?.tweet_results?.result?.rest_id ||
            data?.data?.favorite_tweet?.rest_id ||
            Date.now().toString()

        const tweetText = data?.data?.create_tweet?.tweet_results?.result?.legacy?.full_text ||
            "No text found"

        // Insert into Supabase
        const { error } = await supabase
            .from('tweets')
            .upsert({
                tweet_id: tweetId,
                full_text: tweetText,
                // Add other fields mapping here
                source: 'extension_capture',
                captured_at: new Date().toISOString()
            }, { onConflict: 'tweet_id' })

        if (error) {
            console.error("[APEX Background] Upload failed:", error)
        } else {
            console.log("[APEX Background] Upload success:", tweetId)
        }
    } catch (e) {
        console.error("[APEX Background] Processing error:", e)
    }
}
