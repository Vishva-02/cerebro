import { memo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'

interface RecentActivityProps {
    activities: any[]
    isLoading: boolean
}

export const RecentActivity = memo(({ activities, isLoading }: RecentActivityProps) => {
    return (
        <div className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-textMain">Recent Activity</h2>
                <Link href="/history" className="text-xs font-bold text-primary hover:underline">
                    VIEW ALL
                </Link>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-16 w-full bg-slate-800/50 animate-pulse rounded-xl" />
                    ))
                ) : activities.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-slate-500 text-sm italic">No attempts found yet.</p>
                    </div>
                ) : (
                    activities.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                        >
                            <div>
                                <p className="text-sm font-bold text-textMain truncate max-w-[150px]">{activity.topic}</p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    {format(new Date(activity.createdAt), 'MMM d, p')}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-black text-primary">{activity.score}/{activity.totalQuestions}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black">Score</p>
                                </div>
                                <Link
                                    href={`/results?id=${activity.id}`}
                                    className="p-2 rounded-lg bg-slate-800 hover:bg-primary hover:text-slate-900 transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
})

RecentActivity.displayName = 'RecentActivity'
