"use client"
import { motion } from "framer-motion"

export default function TestAnimation() {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-900">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 bg-blue-500 rounded-lg"
            />
        </div>
    )
}
