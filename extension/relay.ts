import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["https://twitter.com/*", "https://x.com/*"],
    world: "ISOLATED"
}

// Listen for messages from MAIN world (content.ts)
window.addEventListener("message", (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) return

    if (event.data.type && (event.data.type === "APEX_CAPTURE")) {
        console.log("[APEX Relay] Received:", event.data.payload)

        // Forward to Background Worker
        chrome.runtime.sendMessage({
            type: "APEX_UPLOAD",
            payload: event.data.payload
        })
    }
})

console.log("[APEX] Relay script loaded!")
