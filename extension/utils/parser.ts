/**
 * Parser for X.com GraphQL Responses
 * Flattens deeply nested JSON into a standardized Tweet object.
 */

interface TweetLegacy {
    full_text?: string;
    created_at?: string;
    favorite_count?: number;
    retweet_count?: number;
    reply_count?: number;
    quote_count?: number;
    entities?: {
        media?: Array<{
            media_url_https?: string;
            type?: string;
            video_info?: {
                variants?: Array<{
                    bitrate?: number;
                    url?: string;
                }>;
            };
        }>;
    };
    is_quote_status?: boolean;
}

interface UserLegacy {
    name?: string;
    screen_name?: string;
    profile_image_url_https?: string;
}

interface TweetResult {
    rest_id?: string;
    legacy?: TweetLegacy;
    core?: {
        user_results?: {
            result?: {
                legacy?: UserLegacy;
            };
        };
    };
    quoted_status_result?: {
        result?: TweetResult;
    };
}

export interface ParsedTweet {
    tweet_id: string;
    tweet_url: string;
    full_text: string;
    user_name: string;
    user_screen_name: string;
    user_avatar: string;
    media_urls: string[];
    video_url?: string;
    created_at: string;
    metrics: {
        likes: number;
        retweets: number;
        replies: number;
        quotes: number;
    };
    is_quoted?: boolean;
    quoted_tweet?: ParsedTweet;
    source: string;
    captured_at: string;
}

export function parseTweet(rawData: any, sourceTag: string = "extension"): ParsedTweet | null {
    try {
        // 1. Locate the core result object (The "Onion" Peeling)
        const paths = [
            ['data', 'create_tweet', 'tweet_results', 'result'],
            ['data', 'favorite_tweet', 'result'],
            ['data', 'create_bookmark', 'tweet_results', 'result'],
            ['data', 'tweetResult', 'result']
        ];

        const get = (path: string[], obj: any) => path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);

        let result: TweetResult | undefined;
        for (const path of paths) {
            const found = get(path, rawData);
            if (found) {
                result = found;
                if (result && (result as any).tweet) {
                    result = (result as any).tweet;
                }
                break;
            }
        }

        if (!result || !result.legacy) return null;

        // 2. Extract Fields
        const legacy = result.legacy;
        const user = result.core?.user_results?.result?.legacy;

        // Media Extraction
        const mediaUrls: string[] = [];
        let videoUrl: string | undefined;

        if (legacy.entities?.media) {
            legacy.entities.media.forEach((m) => {
                if (m.type === 'photo' && m.media_url_https) {
                    mediaUrls.push(m.media_url_https);
                } else if (m.type === 'video' || m.type === 'animated_gif') {
                    if (m.media_url_https) mediaUrls.push(m.media_url_https);
                    if (m.video_info?.variants) {
                        const bestVariant = m.video_info.variants
                            .filter(v => v.bitrate !== undefined)
                            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
                        if (bestVariant?.url) videoUrl = bestVariant.url;
                    }
                }
            });
        }

        // Quoted Tweet
        let quotedTweet: ParsedTweet | undefined;
        if (legacy.is_quote_status && result.quoted_status_result?.result) {
            const quoteRawWrapper = { data: { tweetResult: { result: result.quoted_status_result.result } } };
            const q = parseTweet(quoteRawWrapper, "quote");
            if (q) quotedTweet = q;
        }

        // Extract user info - screen_name and name are in userResults.core
        const userResults = result.core?.user_results?.result as any;

        // Try to find screen_name in multiple places
        let screenName = userResults?.core?.screen_name ||
            userResults?.legacy?.screen_name ||
            user?.screen_name ||
            (result as any).core?.user_result?.result?.legacy?.screen_name ||
            "unknown";

        const userName = userResults?.core?.name ||
            userResults?.legacy?.name ||
            user?.name ||
            (result as any).core?.user_result?.result?.legacy?.name ||
            "Unknown";

        const userAvatar = user?.profile_image_url_https ||
            userResults?.legacy?.profile_image_url_https ||
            "";

        const tweetId = result.rest_id || "unknown";

        // Fallback URL if screen_name is unknown
        const urlUser = screenName === "unknown" ? "i" : screenName;

        return {
            tweet_id: tweetId,
            tweet_url: `https://x.com/${urlUser}/status/${tweetId}`,
            full_text: legacy.full_text || "",
            user_name: userName,
            user_screen_name: screenName,
            user_avatar: userAvatar,
            media_urls: mediaUrls,
            video_url: videoUrl,
            created_at: legacy.created_at ? new Date(legacy.created_at).toISOString() : new Date().toISOString(),
            metrics: {
                likes: legacy.favorite_count || 0,
                retweets: legacy.retweet_count || 0,
                replies: legacy.reply_count || 0,
                quotes: legacy.quote_count || 0
            },
            is_quoted: sourceTag === "quote",
            quoted_tweet: quotedTweet,
            source: sourceTag,
            captured_at: new Date().toISOString()
        };

    } catch (e) {
        console.error("[Parser] Error parsing tweet:", e);
        return null;
    }
}

export function parseTimeline(rawData: any, sourceTag: string): ParsedTweet[] {
    const tweets: ParsedTweet[] = [];
    try {
        console.log("[Parser] parseTimeline called with sourceTag:", sourceTag);

        // Deep exploration of data structure
        const data = rawData?.data;
        const user = data?.user;
        console.log("[Parser] data.user keys:", Object.keys(user || {}));

        const result = user?.result;
        console.log("[Parser] data.user.result keys:", Object.keys(result || {}));
        console.log("[Parser] data.user.result.__typename:", result?.__typename);

        // Try multiple possible paths
        const timelineV2 = result?.timeline_v2 || result?.timeline;
        console.log("[Parser] timeline object keys:", Object.keys(timelineV2 || {}));

        const timeline = timelineV2?.timeline;
        console.log("[Parser] timeline.timeline keys:", Object.keys(timeline || {}));

        // 1. Locate Instructions - try multiple paths
        let instructions = timeline?.instructions ||
            result?.timeline?.instructions ||
            data?.bookmark_timeline_v2?.timeline?.instructions ||
            data?.user_result?.result?.timeline_v2?.timeline?.instructions;

        console.log("[Parser] Instructions found:", !!instructions, Array.isArray(instructions) ? instructions.length : 0);

        if (!instructions || !Array.isArray(instructions)) {
            console.log("[Parser] No instructions found. Dumping structure...");
            console.log("[Parser] Full result keys:", Object.keys(result || {}));
            return [];
        }

        // 2. Iterate Instructions
        instructions.forEach((instruction: any) => {
            if (instruction.type === "TimelineAddEntries" && instruction.entries) {
                instruction.entries.forEach((entry: any) => {
                    // 3. Extract Tweet from Entry
                    const itemContent = entry.content?.itemContent;
                    if (itemContent?.tweet_results?.result) {
                        // Construct a wrapper that parseTweet expects
                        const wrapper = {
                            data: {
                                tweetResult: {
                                    result: itemContent.tweet_results.result
                                }
                            }
                        };

                        // Map sourceTag: 'likes_timeline' -> 'like', 'bookmarks_timeline' -> 'bookmark'
                        let mappedSource = sourceTag;
                        if (sourceTag === 'likes_timeline') mappedSource = 'like';
                        if (sourceTag === 'bookmarks_timeline') mappedSource = 'bookmark';

                        const tweet = parseTweet(wrapper, mappedSource);
                        if (tweet) tweets.push(tweet);
                    }
                });
            }
        });

    } catch (e) {
        console.error("[Parser] Error parsing timeline:", e);
    }
    return tweets;
}
