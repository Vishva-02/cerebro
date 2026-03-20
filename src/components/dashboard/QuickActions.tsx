'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, RotateCcw, History, Play } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useState, useEffect } from 'react'

interface QuickActionsProps {
    lastAttempt: any | null
}

export function QuickActions({ lastAttempt }: QuickActionsProps) {
    const router = useRouter()
    const [inProgressSession, setInProgressSession] = useState<any>(null)

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/quiz/session')
                if (res.ok) {
                    const data = await res.json()
                    if (data && !data.isCompleted) {
                        setInProgressSession(data)
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setIsChecking(false)
            }
        }
        checkSession()
    }, [])

    const handleRetakeLast = () => {
        if (!lastAttempt) return
        router.push(`/quiz?topic=${encodeURIComponent(lastAttempt.topic)}&questions=${lastAttempt.totalQuestions}&difficulty=${lastAttempt.difficulty || 'medium'}`)
    }

    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-textMain mb-6">Quick Actions</h2>

            <div className="grid grid-cols-1 gap-4">
                {inProgressSession && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col gap-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-primary">Resume Quiz</span>
                            <span className="text-[10px] font-medium text-slate-400">{inProgressSession.topic}</span>
                        </div>
                        <Button
                            className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
                            onClick={() => router.push('/quiz')}
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            CONTINUE QUIZ
                        </Button>
                    </motion.div>
                )}

                <Link href="/quiz">
                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-textMain border border-slate-700 py-4 flex items-center justify-center gap-3 group">
                        <Plus className="w-5 h-5 text-primary group-hover:rotate-90 transition-transform" />
                        <span className="font-bold">Start New Quiz</span>
                    </Button>
                </Link>

                {lastAttempt && (
                    <Button
                        onClick={handleRetakeLast}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-textMain border border-slate-700 py-4 flex items-center justify-center gap-3 group"
                    >
                        <RotateCcw className="w-5 h-5 text-secondary group-hover:-rotate-45 transition-transform" />
                        <span className="font-bold">Retake Last Quiz</span>
                    </Button>
                )}

                <Link href="/history">
                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-textMain border border-slate-700 py-4 flex items-center justify-center gap-3 group">
                        <History className="w-5 h-5 text-accent" />
                        <span className="font-bold">View history</span>
                    </Button>
                </Link>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Learning Tip</p>
                <p className="text-xs text-slate-400 italic">&quot;Consistency is key. taking even one quiz a day can boost your retention by 40%.&quot;</p>
            </div>
        </div>
    )
}
