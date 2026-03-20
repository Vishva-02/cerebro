import { memo } from 'react'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number // 0-100
  className?: string
}

export const ProgressBar = memo(({
  progress,
  className = '',
}: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className={`w-full bg-slate-200 rounded-full h-2 ${className}`}>
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'
