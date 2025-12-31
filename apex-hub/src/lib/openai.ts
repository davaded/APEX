import OpenAI from 'openai';

export interface AIConfig {
    apiKey?: string;
    baseURL?: string;
    model?: string;
}

const defaultApiKey = process.env.OPENAI_API_KEY;
const defaultBaseURL = process.env.OPENAI_BASE_URL;

export function createOpenAIClient(config?: AIConfig) {
    return new OpenAI({
        apiKey: config?.apiKey || defaultApiKey || 'dummy-key',
        baseURL: config?.baseURL || defaultBaseURL,
        dangerouslyAllowBrowser: true
    });
}

// Helper to generate embedding for a text
export async function generateEmbedding(text: string, config?: AIConfig): Promise<number[]> {
    if (!text) return [];

    const client = createOpenAIClient(config);

    try {
        const response = await client.embeddings.create({
            model: "text-embedding-3-small", // Usually fixed for vector DB compatibility
            input: text.replace(/\n/g, ' '),
            encoding_format: "float",
        });

        return response.data[0].embedding;
    } catch (error: any) {
        console.error("Error generating embedding:", error?.message || error);
        throw error; // Propagate error to caller for better handling
    }
}

// Helper to analyze tweet content for tags and summary
export async function analyzeTweetContent(text: string, config?: AIConfig): Promise<{ tags: string[], summary: string }> {
    if (!text) return { tags: [], summary: '' };

    // Debug: Log config usage (mask key)
    console.log("Analyzing with config:", {
        hasKey: !!config?.apiKey,
        baseURL: config?.baseURL,
        model: config?.model
    });

    const client = createOpenAIClient(config);
    const model = config?.model || "gpt-4o-mini";

    try {
        const prompt = `
        Analyze the following tweet text and extract:
        1. A list of 3-5 relevant hashtags (without # symbol).
        2. A very concise, one-sentence insight or summary (max 15 words).

        Tweet: "${text}"

        Return JSON format:
        {
            "tags": ["tag1", "tag2"],
            "summary": "Insightful summary here."
        }
        `;

        // Try with JSON mode first
        try {
            const response = await client.chat.completions.create({
                model: model,
                messages: [
                    { role: "system", content: "You are a helpful AI assistant that analyzes social media content. You MUST return valid JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.3,
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("Empty content");
            const result = JSON.parse(content);
            return { tags: result.tags || [], summary: result.summary || '' };

        } catch (jsonError) {
            console.warn("JSON mode failed, retrying with plain text...", jsonError);

            // Fallback: Plain text mode (for local models that don't support json_object)
            const response = await client.chat.completions.create({
                model: model,
                messages: [
                    { role: "system", content: "You are a helpful AI assistant. Return ONLY raw JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3,
            });

            const content = response.choices[0].message.content || "{}";
            // Try to extract JSON from text (in case of markdown code blocks)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;

            const result = JSON.parse(jsonStr);
            return { tags: result.tags || [], summary: result.summary || '' };
        }

    } catch (error: any) {
        console.error("Error analyzing tweet:", error);
        if (error?.response) {
            console.error("OpenAI API Error Response:", error.response.data);
        }
        return { tags: [], summary: '' };
    }
}
