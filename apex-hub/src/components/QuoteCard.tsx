"use client";

import { motion } from "framer-motion";

export function QuoteCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full p-8 rounded-3xl bg-gradient-to-br from-emerald-950/30 to-black border border-emerald-500/10 flex flex-col items-center justify-center text-center my-6 break-inside-avoid"
        >
            <span className="text-6xl text-emerald-500/20 mb-4 font-serif leading-none">“</span>
            <p className="font-serif italic text-xl text-zinc-300 text-center leading-relaxed max-w-lg">
                The best way to predict the future is to create it.
            </p>
            <span className="mt-6 text-xs font-sans tracking-widest text-zinc-600 uppercase">
                — AI Insight
            </span>
        </motion.div>
    );
}
