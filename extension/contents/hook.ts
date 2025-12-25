import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["https://twitter.com/*", "https://x.com/*"],
    world: "MAIN",
    run_at: "document_start"
}

console.log("[APEX] Hook (Main World) injected - v3");

// ====== AUTH EXTRACTION ======
// Extract auth from cookies (CSRF token) and use public bearer token

function extractAuthFromCookies(): { authorization: string, csrfToken: string | null } {
    let csrfToken: string | null = null;

    // Get CSRF token from cookie (ct0)
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'ct0') {
            csrfToken = value;
        }
    }

    // X.com's public bearer token - same for all clients
    const authorization = "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

    return { authorization, csrfToken };
}

// Store the last captured API URL
let lastCapturedApiUrl: string | null = null;

// Send auth to background with the API URL
function sendAuthWithApiUrl(apiUrl: string) {
    const { authorization, csrfToken } = extractAuthFromCookies();

    if (!csrfToken) {
        console.log("[APEX Hook] No CSRF token in cookies, skipping auth send");
        return;
    }

    console.log("[APEX Hook] Auth extraction result:", {
        hasAuth: !!authorization,
        hasCsrf: !!csrfToken,
        csrfPreview: csrfToken.substring(0, 10) + "...",
        apiUrl: apiUrl.substring(0, 60) + "..."
    });

    console.log("[APEX Hook] Sending auth with API URL to processor...");
    window.postMessage({
        type: "MINER_AUTH_UPDATE",
        payload: {
            authorization: authorization,
            csrfToken: csrfToken,
            url: apiUrl,  // Use the actual API URL, not the page URL!
            userAgent: navigator.userAgent
        },
        source: "hook"
    }, "*");

    lastCapturedApiUrl = apiUrl;
}

// ====== FETCH INTERCEPT (for data capture) ======
const _originalFetch = window.fetch.bind(window);

window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());

    // Call original fetch
    const response = await _originalFetch(input, init);

    // Data capture (from response)
    if (url.includes("/graphql/")) {
        const clone = response.clone();
        clone.json().then(data => {
            if (
                url.includes("CreateLike") ||
                url.includes("FavoriteTweet") ||
                url.includes("CreateBookmark") ||
                url.includes("TweetDetail") ||
                url.includes("Likes") ||
                url.includes("Bookmarks")
            ) {
                let action = "view";
                if (url.includes("CreateLike") || url.includes("FavoriteTweet")) action = "like";
                if (url.includes("CreateBookmark")) action = "bookmark";
                if (url.includes("Likes")) action = "likes_timeline";
                if (url.includes("Bookmarks")) action = "bookmarks_timeline";

                console.log(`[APEX Hook] Sending APEX_RAW_CAPTURE [${action}]`);
                window.postMessage({
                    type: "APEX_RAW_CAPTURE",
                    payload: data,
                    action: action,
                    source: "hook"
                }, "*");
            }
        }).catch(() => { });
    }

    return response;
};

// ====== XHR INTERCEPT (for auth capture and data capture) ======
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: any[]) {
    (this as any)._apexUrl = url.toString();
    return originalOpen.call(this, method, url, ...rest);
};

XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    const xhr = this;
    const url = (xhr as any)._apexUrl || '';

    // Capture auth ONLY when we detect a GraphQL Likes/Bookmarks API request
    if (url.includes("/i/api/graphql/") && (url.includes("Likes") || url.includes("Bookmarks"))) {
        console.log("[APEX Hook] XHR API request detected:", url.substring(0, 70) + "...");
        // Send auth with the actual API URL
        sendAuthWithApiUrl(url);
    }

    xhr.addEventListener("load", function () {
        if (url.includes("/graphql/")) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (
                    url.includes("CreateLike") ||
                    url.includes("FavoriteTweet") ||
                    url.includes("CreateBookmark") ||
                    url.includes("Likes") ||
                    url.includes("Bookmarks")
                ) {
                    let action = "view";
                    if (url.includes("CreateLike") || url.includes("FavoriteTweet")) action = "like";
                    if (url.includes("CreateBookmark")) action = "bookmark";
                    if (url.includes("Likes")) action = "likes_timeline";
                    if (url.includes("Bookmarks")) action = "bookmarks_timeline";

                    window.postMessage({
                        type: "APEX_RAW_CAPTURE",
                        payload: data,
                        action: action,
                        source: "hook"
                    }, "*");
                }
            } catch (e) { }
        }
    });

    return originalSend.call(this, body);
};
