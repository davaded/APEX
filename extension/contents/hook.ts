import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["https://twitter.com/*", "https://x.com/*"],
    world: "MAIN",
    run_at: "document_start"
}

console.log("[APEX] Hook (Main World) injected");

// Intercept Fetch
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    const [resource, config] = args;
    const url = resource.toString();

    const response = await originalFetch(...args);

    // Check for GraphQL
    if (url.includes("/graphql/")) {
        // Clone response
        const clone = response.clone();

        clone.json().then(data => {
            if (
                url.includes("CreateLike") ||
                url.includes("FavoriteTweet") ||
                url.includes("CreateBookmark") ||
                url.includes("TweetDetail")
            ) {
                let action = "view";
                if (url.includes("CreateLike") || url.includes("FavoriteTweet")) action = "like";
                if (url.includes("CreateBookmark")) action = "bookmark";

                window.postMessage({
                    type: "APEX_RAW_CAPTURE",
                    payload: data,
                    action: action,
                    source: "hook"
                }, "*");
            }
        }).catch(err => { });
    }

    return response;
};

// XHR Intercept
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {
    this.addEventListener("load", function () {
        if (url && url.toString().includes("/graphql/")) {
            try {
                const responseText = this.responseText;
                if (responseText) {
                    const data = JSON.parse(responseText);
                    if (
                        url.toString().includes("CreateLike") ||
                        url.toString().includes("FavoriteTweet") ||
                        url.toString().includes("CreateBookmark")
                    ) {
                        let action = "view";
                        if (url.toString().includes("CreateLike") || url.toString().includes("FavoriteTweet")) action = "like";
                        if (url.toString().includes("CreateBookmark")) action = "bookmark";

                        window.postMessage({
                            type: "APEX_RAW_CAPTURE",
                            payload: data,
                            action: action,
                            source: "hook"
                        }, "*");
                    }
                }
            } catch (e) { }
        }
    });
    originalOpen.apply(this, arguments as any);
};
