import type { PlasmoCSConfig } from "plasmo"
import { saveTweet } from "../storage"
import { parseTweet, type ParsedTweet } from "../utils/parser"

export const config: PlasmoCSConfig = {
    matches: ["https://twitter.com/*", "https://x.com/*"],
    // world: "ISOLATED", // Default
    run_at: "document_start"
}

console.log("[APEX] Processor (Isolated World) Ready");

// Listen for messages from Main World
window.addEventListener("message", async (event) => {
    if (event.source !== window) return;

    if (event.data?.type === "APEX_RAW_CAPTURE" && event.data?.source === "hook") {
        const rawData = event.data.payload;
        const action = event.data.action;

        console.log(`[APEX] Raw Capture Received [${action}]`);

        // 1. Parse Data
        const tweet = parseTweet(rawData, "extension_" + action);

        if (tweet) {
            console.log("[APEX] Parsed Tweet:", tweet.tweet_id);

            // 2. Visual Feedback
            showToast(`Captured: ${tweet.user_name}`, "success");

            // 3. Save to Local Cache (IndexedDB)
            await saveTweet(tweet);

            // 4. Send to Background for Upload (Supabase)
            chrome.runtime.sendMessage({
                type: "APEX_UPLOAD",
                payload: tweet
            });
        }
    }
});

function showToast(message: string, type: "success" | "info" = "info") {
    const toast = document.createElement("div");
    const bg = type === "success" ? "#22c55e" : "#3b82f6";
    toast.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${bg}; color: white; padding: 12px 24px; border-radius: 8px; z-index: 99999; font-family: sans-serif; font-weight: bold; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transition: opacity 0.5s;`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

showToast("APEX: Processor Ready", "info");
