
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env from .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envVars = envContent.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            acc[key.trim()] = value.trim();
        }
        return acc;
    }, {});
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch(query) {
    console.log(`Searching for '${query}'...`);

    const { data, error } = await supabase
        .from("tweets")
        .select("tweet_id, full_text, user_name")
        .ilike("full_text", `%${query}%`)
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found:", data.length, "results");
        console.log(JSON.stringify(data, null, 2));
    }
}

testSearch("AI");
testSearch("Zen");
testSearch("Crypto"); // Should be empty
