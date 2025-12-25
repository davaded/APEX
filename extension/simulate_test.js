// 1. Open https://x.com in Chrome
// 2. Open Developer Tools (F12) -> Console
// 3. Paste this entire script and hit Enter

(function simulateCapture() {
    console.log("🚀 Simulating APEX Capture Event...");

    const mockTweet = {
        data: {
            favorite_tweet: {
                result: {
                    __typename: "Tweet",
                    rest_id: "1234567890_" + Date.now(), // Unique ID every time
                    legacy: {
                        full_text: "This is a simulated tweet for APEX auto-upload verification. #Testing " + new Date().toISOString(),
                        created_at: new Date().toDateString(),
                        favorite_count: 42,
                        retweet_count: 7,
                        reply_count: 3,
                        quote_count: 1,
                        entities: {
                            media: []
                        }
                    },
                    core: {
                        user_results: {
                            result: {
                                legacy: {
                                    name: "APEX Tester",
                                    screen_name: "apex_test_bot",
                                    profile_image_url_https: "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    window.postMessage({
        type: "APEX_RAW_CAPTURE",
        payload: mockTweet,
        action: "like", // Matches 'like' constraint in DB
        source: "hook"
    }, "*");

    console.log("✅ Event dispatched! Check the 'Captured' toast and Supabase table.");
})();
