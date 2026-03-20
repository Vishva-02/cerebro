import { memo } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Target, BarChart3, HelpCircle } from 'lucide-react'

interface StatsCardsProps {
    stats: {
        totalQuizzes: number
        avgScore: number
        highestScore: number
        totalQuestions: number
    } | null
    isLoading: boolean
}

export const StatsCards = memo(({ stats, isLoading }: StatsCardsProps) => {
    const cards = [
        {
            label: 'Total Quizzes',
            value: stats?.totalQuizzes ?? 0,
            icon: <BarChart3 className="w-5 h-5 text-primary" />,
            color: 'bg-primary/10',
        },
        {
            label: 'Average Score',
            value: `${stats?.avgScore ?? 0}%`,
            icon: <Target className="w-5 h-5 text-secondary" />,
            color: 'bg-secondary/10',
        },
        {
            label: 'Highest Score',
            value: stats?.highestScore ?? 0,
            icon: <Trophy className="w-5 h-5 text-accent" />,
            color: 'bg-accent/10',
        },
        {
            label: 'Questions Solved',
            value: stats?.totalQuestions ?? 0,
            icon: <HelpCircle className="w-5 h-5 text-emerald-400" />,
            color: 'bg-emerald-400/10',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {cards.map((card, index) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 flex items-center gap-5 hover:border-primary/30 transition-all group"
                >
                    <div className={`p-4 rounded-2xl ${card.color} group-hover:scale-110 transition-transform`}>
                        {card.icon}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
                        {isLoading ? (
                            <div className="h-8 w-16 bg-slate-800 animate-pulse rounded-md mt-1" />
                        ) : (
                            <p className="text-2xl font-black text-textMain mt-0.5">{card.value}</p>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    )
})

StatsCards.displayName = 'StatsCards'
