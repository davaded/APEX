import type { PlasmoCSConfig } from "plasmo"
import { saveTweet } from "./storage"

export const config: PlasmoCSConfig = {
    matches: ["https://twitter.com/*", "https://x.com/*"],
    world: "MAIN",
    run_at: "document_start"
}

console.log("[APEX] Content script loaded!")

// Test DB on load
saveTweet({ test: "init", time: Date.now() }).then(() => console.log("[APEX] DB Init Test Done"))

// Helper to dispatch to Relay
function dispatchToRelay(data: any) {
    window.postMessage({ type: "APEX_CAPTURE", payload: data }, "*")
}

// Intercept Fetch
const originalFetch = window.fetch
window.fetch = async (...args) => {
    const [resource, config] = args
    // console.log("[APEX] Fetch:", resource.toString()) 
    const response = await originalFetch(...args)
    const clone = response.clone()
    if (resource.toString().includes("/graphql/")) {
        try {
            const data = await clone.json()
            console.log("[APEX] GraphQL (Fetch):", resource.toString())
            if (resource.toString().includes("CreateLike") || resource.toString().includes("FavoriteTweet") || resource.toString().includes("CreateBookmark")) {
                console.log("[APEX] Action (Fetch):", data)
                saveTweet(data)
                dispatchToRelay(data)
            }
        } catch (e) { }
    }
    return response
}

// Intercept XHR
const originalOpen = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function (method, url) {
    // console.log("[APEX] XHR:", url)
    this.addEventListener("load", function () {
        if (url && url.toString().includes("/graphql/")) {
            console.log("[APEX] GraphQL (XHR):", url)
            try {
                const data = JSON.parse(this.responseText)
                if (url.toString().includes("CreateLike") || url.toString().includes("FavoriteTweet") || url.toString().includes("CreateBookmark")) {
                    console.log("[APEX] Action (XHR):", data)
                    saveTweet(data)
                    dispatchToRelay(data)
                }
            } catch (e) { }
        }
    })
    originalOpen.apply(this, arguments as any)
}
