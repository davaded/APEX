"use client";

import { useEffect, useState } from "react";
import { fetchQuantifiedStats, QuantifiedStats } from "@/lib/stats";
import { ArrowUpRight, Database, Activity, PieChart, Loader2 } from "lucide-react";
import Image from "next/image";

export function QuantifiedSelf() {
    const [stats, setStats] = useState<QuantifiedStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await fetchQuantifiedStats();
            setStats(data);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!stats) return null;

    // Normalizing velocity for the bars (safe divide)
    const maxVelocity = Math.max(...stats.velocityScores, 1);

    return (
        // 整体背景保持深黑，文字灰白
        <div className="p-8 space-y-8 min-h-screen bg-[#050505] text-zinc-200 animate-in fade-in duration-700">

            {/* Header */}
            <div className="mb-12 border-b border-white/5 pb-6">
                <h1 className="font-serif text-4xl text-zinc-100 mb-2">Quantified Self</h1>
                {/* 使用等宽字体显示系统状态，绿色仅用于强调 "Online" */}
                <p className="text-zinc-500 text-sm tracking-wide uppercase font-mono">
                    System Status: <span className="text-emerald-500 animate-pulse">Online</span>
                </p>
            </div>

            {/* Grid 布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Metric Card 1: 普通数据卡片 */}
                <MetricCard
                    label="Knowledge Base"
                    value={stats.totalTweets.toLocaleString()}
                    unit="Artifacts"
                    icon={<Database size={16} />}
                    trend="Live"
                />

                {/* Metric Card 2: 重点数据卡片 (isHigh) */}
                <MetricCard
                    label="Weekly Growth"
                    value={stats.velocityScores.reduce((a, b) => a + b, 0).toString()}
                    unit="Capture Velocity"
                    icon={<Activity size={16} />}
                    trend={`${stats.weekOverWeek > 0 ? '+' : ''}${stats.weekOverWeek}%`}
                    isHigh // 这一项的数据会有更明显的绿色倾向
                />

                {/* Chart Card: 纯绿色渐变图表 */}
                <div className="col-span-1 lg:col-span-2 rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Capture Velocity (7 Days)</h3>
                        {/* 右上角状态指示器 */}
                        <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Live
                        </div>
                    </div>

                    {/* 柱状图区域 */}
                    <div className="h-32 w-full flex items-end gap-2">
                        {stats.velocityScores.map((score, i) => {
                            const h = (score / maxVelocity) * 100;
                            // Minimum height for visibility if score is 0 but we want to show the day exists? 
                            // Or 0 height. Let's do a tiny min height for visual consistency if desired, or 0.
                            const safeH = Math.max(h, 5);

                            return (
                                <div
                                    key={i}
                                    style={{ height: `${safeH}%` }}
                                    // 【重点修改】去掉了所有杂色，只用 Emerald 的透明度变化来制造层次
                                    className="flex-1 bg-gradient-to-t from-emerald-950/0 via-emerald-900/40 to-emerald-500/80 rounded-t-sm hover:to-emerald-400 transition-all cursor-pointer relative group/bar"
                                    title={`${score} tweets`}
                                >
                                    {/* 顶部微弱高光线，增加质感 */}
                                    <div className="absolute top-0 inset-x-0 h-[1px] bg-emerald-400/50 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* List Card: Top Sources */}
                <div className="col-span-1 lg:col-span-2 row-span-2 rounded-2xl border border-white/5 bg-[#0A0A0A] flex flex-col">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Top Sources</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {stats.topAuthors.length > 0 ? stats.topAuthors.map((author, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    {/* 头像占位符：默认灰，Hover变绿 */}
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-500 border border-white/5 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors overflow-hidden relative">
                                        {author.avatar ? (
                                            <Image src={author.avatar} alt={author.name} fill className="object-cover" />
                                        ) : (
                                            author.name[0]
                                        )}
                                    </div>
                                    <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{author.name}</span>
                                </div>
                                {/* 数字：使用等宽字体 */}
                                <div className="text-xs font-mono text-zinc-600 group-hover:text-emerald-500 transition-colors">
                                    {author.count}
                                </div>
                            </div>
                        )) : (
                            <div className="p-6 text-zinc-600 italic text-sm">No knowledge sources yet.</div>
                        )}
                    </div>
                </div>

                {/* Diet Card: Information Diet (颜色对比修正) */}
                <div className="col-span-1 lg:col-span-2 rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Information Diet</h3>
                        <PieChart size={14} className="text-zinc-600" />
                    </div>

                    <div className="space-y-6">
                        {/* 【重点修改】主成分：使用品牌色 (Emerald) 并带有光晕 */}
                        <ProgressBar
                            label="Visual Media"
                            value={stats.mediaDiet.visual}
                            color="bg-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]"
                        />

                        {/* 【重点修改】次成分：使用深灰色 (Zinc)，表示"非重点"，剔除紫色 */}
                        <ProgressBar
                            label="Text Content"
                            value={stats.mediaDiet.textOnly}
                            color="bg-zinc-700"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

// 子组件：单一数据指标卡片
function MetricCard({ label, value, unit, icon, trend, isHigh }: any) {
    return (
        <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 flex flex-col justify-between hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</h3>
                {/* 图标逻辑：默认暗灰，Hover时如果是重要数据(isHigh)则变绿，否则变亮白 */}
                <div className={`text-zinc-700 transition-colors ${isHigh ? 'group-hover:text-emerald-500' : 'group-hover:text-zinc-200'}`}>
                    {icon}
                </div>
            </div>
            <div>
                <div className="flex items-baseline gap-2">
                    {/* 大数字使用等宽字体 */}
                    <span className="font-mono text-4xl text-zinc-200 tracking-tighter group-hover:text-white transition-colors">{value}</span>
                    <span className="text-xs text-zinc-600">{unit}</span>
                </div>
                {/* 趋势数据默认灰色，Hover变绿 */}
                <div className={`mt-2 flex items-center gap-1 text-xs transition-colors ${isHigh ? 'text-emerald-500/70' : 'text-zinc-600'} group-hover:text-emerald-500`}>
                    <ArrowUpRight size={12} />
                    <span>{trend}</span>
                </div>
            </div>
        </div>
    );
}

// 子组件：进度条
function ProgressBar({ label, value, color }: any) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-400">{label}</span>
                <span className="font-mono text-zinc-500">{value}%</span>
            </div>
            {/* 轨道背景更暗 */}
            <div className="h-2 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
