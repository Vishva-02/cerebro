import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

export function DashboardHeader() {
    const { data: session } = useSession()

    return (
        <div className="mb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-textMain">
                        Welcome back, <span className="text-primary">{session?.user?.name?.split(' ')[0] || 'Scholar'}</span>!
                    </h1>
                    <p className="mt-1 text-slate-400">Here&apos;s a summary of your learning progress.</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/50 border border-slate-700">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Active Session</span>
                </div>
            </motion.div>
        </div>
    )
}
