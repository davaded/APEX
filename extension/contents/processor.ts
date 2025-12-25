import type { PlasmoCSConfig } from "plasmo"
import { saveTweet } from "../storage"
import { parseTweet, parseTimeline, type ParsedTweet } from "../utils/parser"

export const config: PlasmoCSConfig = {
    matches: ["https://twitter.com/*", "https://x.com/*"],
    // world: "ISOLATED", // Default
    run_at: "document_start"
}

console.log("[APEX] Processor (Isolated World) Ready");

// Listen for messages from Main World
window.addEventListener("message", async (event) => {
    if (event.source !== window) return;

    // Relay Auth to Background Script
    if (event.data?.type === "MINER_AUTH_UPDATE" && event.data?.source === "hook") {
        console.log("[APEX Processor] Received MINER_AUTH_UPDATE from hook");
        console.log("[APEX Processor] Relaying to background via chrome.runtime.sendMessage...");
        try {
            chrome.runtime.sendMessage({
                type: "MINER_AUTH_UPDATE",
                payload: event.data.payload
            });
            console.log("[APEX Processor] Relay complete.");
        } catch (e) {
            console.error("[APEX Processor] Relay FAILED:", e);
        }
        return;
    }

    if (event.data?.type === "APEX_RAW_CAPTURE" && event.data?.source === "hook") {
        const rawData = event.data.payload;
        const action = event.data.action;

        console.log(`[APEX Processor] Raw Capture Received [${action}]`);
        console.log(`[APEX Processor] Payload keys:`, Object.keys(rawData?.data || rawData || {}));

        // Handle Timeline Batches
        if (action === "likes_timeline" || action === "bookmarks_timeline") {
            const tweets = parseTimeline(rawData, action);
            if (tweets.length > 0) {
                console.log(`[APEX] Batch Parsed: ${tweets.length} tweets`);

                let savedCount = 0;
                for (const tweet of tweets) {
                    await saveTweet(tweet);
                    savedCount++;
                }

                if (savedCount > 0) {
                    showToast(`Batch Captured: ${savedCount} tweets`, "success");
                    chrome.runtime.sendMessage({ type: "APEX_TRIGGER_SYNC" });
                }
            }
            return;
        }

        // Handle Single Actions
        const tweet = parseTweet(rawData, action);

        if (tweet) {
            console.log("[APEX] Parsed Tweet:", tweet.tweet_id);

            // 2. Visual Feedback
            showToast(`Captured: ${tweet.user_name}`, "success");

            // 3. Save to Local Cache (IndexedDB)
            await saveTweet(tweet);

            // 4. Trigger Background Sync (Batch/Debounced)
            chrome.runtime.sendMessage({
                type: "APEX_TRIGGER_SYNC"
            });
        }
    }
});

function showToast(message: string, type: "success" | "info" = "info") {
    if (!document.body) {
        window.addEventListener("DOMContentLoaded", () => showToast(message, type), { once: true });
        return;
    }

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
