'use client'

import { useEffect, useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Layers } from 'lucide-react'

interface InsightItem {
    topic: string
    correct: number
    incorrect: number
}

const CustomFloatingBar = (props: any) => {
    const { x, y, width, height, fill, type } = props

    // Anti-gravity logic: 
    // For 'correct' (up), y is the top, height is height.
    // For 'incorrect' (down), we want it to start from the center and go down.
    // In Recharts BarChart, if we have two bars, they are side-by-side or stacked.
    // We'll use a single BarChart with offset data or two distinct Bar sets.

    const isUp = type === 'correct'
    const borderRadius = 8

    return (
        <g>
            {/* Drop Shadow / Glow */}
            <defs>
                <filter id={`glow-${type}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* The Bar */}
            <motion.rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                initial={{ height: 0, y: isUp ? y + height : y }}
                animate={{ height, y }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                rx={borderRadius}
                style={{ filter: `drop-shadow(0px ${isUp ? 4 : -4}px 8px ${fill}44)` }}
            />

            {/* Top/Bottom Cap Light */}
            <rect
                x={x}
                y={isUp ? y : y + height - 2}
                width={width}
                height={2}
                fill="rgba(255,255,255,0.3)"
                rx={1}
            />
        </g>
    )
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const correct = payload.find((p: any) => p.dataKey === 'correct')?.value || 0
        const incorrect = payload.find((p: any) => p.dataKey === 'incorrect')?.value || 0
        const total = correct + incorrect
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

        return (
            <div className="glass-card p-4 shadow-2xl border-primary/20 min-w-[180px]">
                <p className="text-sm font-bold text-textMain mb-2 border-b border-slate-700 pb-1">{label}</p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-success">
                            <TrendingUp className="w-3 h-3" /> Correct
                        </span>
                        <span className="font-mono font-bold text-slate-200">{correct}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-error">
                            <TrendingDown className="w-3 h-3" /> Incorrect
                        </span>
                        <span className="font-mono font-bold text-slate-200">{incorrect}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter">Accuracy</span>
                        <span className="text-sm font-black text-primary">{percentage}%</span>
                    </div>
                </div>
            </div>
        )
    }
    return null
}

export const FloatingInsights = () => {
    const [data, setData] = useState<InsightItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard/insights')
                const json = await res.json()
                // Format data for Recharts: incorrect should be negative for 'floating down' effect
                const formatted = json.items.map((item: any) => ({
                    ...item,
                    incorrect: -Math.abs(item.incorrect) // Make negative for downward display
                }))
                setData(formatted)
            } catch (err) {
                console.error('Failed to load insights:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return (
        <div className="glass-card h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 font-medium">Gathering topic insights...</p>
            </div>
        </div>
    )

    if (data.length === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 space-y-6 overflow-hidden relative"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-textMain tracking-tight">Floating Insights</h3>
                        <p className="text-xs text-slate-500 font-medium">Strengths (Up) vs Weaknesses (Down)</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Flow</span>
                </div>
            </div>

            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        stackOffset="sign"
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                            dataKey="topic"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />

                        {/* Correct - Upward */}
                        <Bar
                            dataKey="correct"
                            stackId="a"
                            shape={<CustomFloatingBar type="correct" />}
                            fill="#2dd4bf"
                        />

                        {/* Incorrect - Downward */}
                        <Bar
                            dataKey="incorrect"
                            stackId="a"
                            shape={<CustomFloatingBar type="incorrect" />}
                            fill="#ef4444"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-error/5 rounded-full blur-3xl -z-10"></div>
        </motion.div>
    )
}
