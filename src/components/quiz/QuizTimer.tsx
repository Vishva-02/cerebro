'use client'

import { useEffect, useState, memo } from 'react'

interface QuizTimerProps {
    startTime: string | Date
    timeLimitMinutes: number | null
    onTimeUp: () => void
}

export const QuizTimer = memo(({ startTime, timeLimitMinutes, onTimeUp }: QuizTimerProps) => {
    const timeLimitMs = timeLimitMinutes ? timeLimitMinutes * 60 * 1000 : null
    const [timeLeft, setTimeLeft] = useState<number | null>(null)

    useEffect(() => {
        if (!timeLimitMs || !startTime) return

        const tick = () => {
            const elapsed = Date.now() - new Date(startTime).getTime()
            const remaining = Math.max(0, timeLimitMs - elapsed)
            setTimeLeft(remaining)

            if (remaining === 0) {
                onTimeUp()
            }
        }

        tick()
        const timer = setInterval(tick, 1000)
        return () => clearInterval(timer)
    }, [startTime, timeLimitMs, onTimeUp])

    if (timeLeft === null) return null

    const totalSeconds = Math.floor(timeLeft / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`

    const getTimerColorClass = () => {
        if (!timeLimitMs) return 'bg-slate-800 text-primary border-slate-700'
        const ratio = timeLeft / timeLimitMs
        if (ratio > 0.5) return 'bg-slate-800 text-primary border-slate-700'
        if (ratio > 0.2) return 'bg-orange-500/20 text-orange-400 border-orange-500/40'
        return 'bg-error text-white font-bold animate-pulse border-error shadow-[0_0_20px_rgba(239,68,68,0.5)]'
    }

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${getTimerColorClass()}`}>
            <span className="text-sm opacity-80">⏱ Time:</span>
            <span className="text-lg tracking-wider font-mono">
                {timeString}
            </span>
        </div>
    )
})

QuizTimer.displayName = 'QuizTimer'
