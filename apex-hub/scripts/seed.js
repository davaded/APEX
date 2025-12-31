
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
    console.error("Missing Supabase env vars. URL:", supabaseUrl);
    // Fallback or exit
    if (!supabaseUrl) process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SAMPLE_TWEETS = [
    {
        full_text: "The future of AI is not just LLMs, but neuro-symbolic systems that combine logic with intuition. #AI #Future",
        user_name: "Dr. Nexus",
        user_screen_name: "dr_nexus",
        tweet_created_at: new Date().toISOString(),
        user_avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nexus",
        tweet_id: "101",
        metrics: { likes: 42, retweets: 12, replies: 5, quotes: 1 }
    },
    {
        full_text: "Minimalist design isn't about removing things, it's about adding meaning to what remains. The void is part of the structure. #Design #Zen",
        user_name: "Zen Architect",
        user_screen_name: "zen_arch",
        tweet_created_at: new Date(Date.now() - 86400000).toISOString(),
        user_avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zen",
        tweet_id: "102",
        metrics: { likes: 128, retweets: 45, replies: 10, quotes: 3 }
    },
    {
        full_text: "Quantum computing update: We achieved stable coherence for 10ms. This changes everything for cryptography. #Quantum #Tech",
        user_name: "Quantum Leap",
        user_screen_name: "q_leap",
        tweet_created_at: new Date(Date.now() - 172800000).toISOString(),
        user_avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Quantum",
        tweet_id: "103",
        metrics: { likes: 1024, retweets: 512, replies: 200, quotes: 50 }
    },
    {
        full_text: "Studying the neural topology of the human brain reveals striking similarities to cosmic web structures. As above, so below. #Science #Space",
        user_name: "Astro Bio",
        user_screen_name: "astro_bio",
        tweet_created_at: new Date(Date.now() - 250000000).toISOString(),
        user_avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Astro",
        tweet_id: "104",
        metrics: { likes: 89, retweets: 20, replies: 8, quotes: 2 }
    },
    {
        full_text: "React Server Components are confusing at first, but the performance gains for initial load are undeniable. #React #WebDev",
        user_name: "Dev Guru",
        user_screen_name: "dev_guru",
        tweet_created_at: new Date(Date.now() - 3000000).toISOString(),
        user_avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev",
        tweet_id: "105",
        metrics: { likes: 256, retweets: 64, replies: 32, quotes: 8 }
    },
    {
        full_text: "Just deployed the new neural interface. Latency is down to 5ms. It feels like an extension of my own mind. #Cybernetics",
        user_name: "Cyborg 009",
        user_screen_name: "cyborg_009",
        tweet_created_at: new Date(Date.now() - 500000000).toISOString(),
        user_avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cyborg",
        tweet_id: "106",
        metrics: { likes: 512, retweets: 128, replies: 64, quotes: 16 }
    }
];

async function seed() {
    console.log("Seeding database...");

    for (const tweet of SAMPLE_TWEETS) {
        const { error } = await supabase.from('tweets').upsert(tweet, { onConflict: 'tweet_id' });
        if (error) console.error("Error inserting tweet:", error);
        else console.log(`Inserted tweet ${tweet.tweet_id}`);
    }

    console.log("Done!");
}

seed();
