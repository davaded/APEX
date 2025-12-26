"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export function QuoteCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full p-8 rounded-3xl bg-gradient-to-br from-emerald-900/20 to-zinc-900/40 border border-emerald-500/10 flex flex-col items-center justify-center text-center gap-4 my-6 break-inside-avoid"
        >
            <Quote className="w-8 h-8 text-emerald-500/50" />
            <p className="font-serif text-2xl text-emerald-100/90 italic leading-relaxed max-w-lg">
                "The best way to predict the future is to create it."
            </p>
            <span className="text-xs font-mono text-emerald-500/50 tracking-widest uppercase">
                AI Insight
            </span>
        </motion.div>
    );
}
