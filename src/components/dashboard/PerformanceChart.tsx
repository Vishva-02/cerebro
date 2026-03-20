'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts'

interface PerformanceChartProps {
    data: any[]
    isLoading: boolean
}

export function PerformanceChart({ data, isLoading }: PerformanceChartProps) {
    return (
        <div className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-textMain">Performance Trend</h2>
                    <p className="text-xs text-slate-500 mt-1">Your score percentage over time</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score %</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full mt-4">
                {isLoading ? (
                    <div className="h-full w-full bg-slate-800/20 animate-pulse rounded-xl" />
                ) : data.length < 2 ? (
                    <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-3xl">
                        <div className="p-4 rounded-full bg-slate-800/50 mb-4">
                            <LineChart width={24} height={24} data={[{ x: 0, y: 0 }]}>
                                <Line type="monotone" dataKey="y" stroke="#2DD4BF" strokeWidth={2} dot={false} />
                            </LineChart>
                        </div>
                        <p className="text-slate-500 text-sm">Target achieved! Take more quizzes to see your growth chart.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E293B',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                }}
                                itemStyle={{ color: '#F1F5F9', fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#2DD4BF', fontSize: '10px', fontWeight: '900', marginBottom: '4px', textTransform: 'uppercase' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#2DD4BF"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorScore)"
                                activeDot={{ r: 6, stroke: '#0F172A', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
