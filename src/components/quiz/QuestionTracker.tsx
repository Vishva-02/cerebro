import { memo } from 'react'
import { motion } from 'framer-motion'

type Props = {
  count: number
  currentIndex: number
  answers: Record<number, number>
  marked: Record<number, boolean>
  skipped: Record<number, boolean>
  onSelect: (index: number) => void
}

export const QuestionTracker = memo(({
  count,
  currentIndex,
  answers,
  marked,
  skipped,
  onSelect,
}: Props) => {
  return (
    <div className="glass-card p-4 lg:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white/90">Question Tracker</h3>
          <p className="text-xs text-slate-300/70">Tap a number to jump</p>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-success"></span> Answered
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#A855F7]"></span> Skipped
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-error opacity-80"></span> Unanswered
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-6">
        {Array.from({ length: count }, (_, i) => {
          const isAnswered = answers[i] !== undefined
          const isSkipped = Boolean(skipped[i])
          const isMarked = Boolean(marked[i])
          const isCurrent = i === currentIndex

          const base =
            'relative flex aspect-square items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ease-in-out cursor-pointer'

          let stateClasses = ''
          if (isCurrent) {
            stateClasses = 'bg-primary text-slate-900 shadow-[0_0_15px_rgba(45,212,191,0.4)] scale-105'
          } else if (isAnswered) {
            stateClasses = 'bg-success text-white hover:brightness-110'
          } else if (isSkipped) {
            stateClasses = 'bg-[#A855F7] text-white hover:brightness-110'
          } else {
            stateClasses = 'bg-error text-white opacity-80 hover:opacity-100'
          }

          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`${base} ${stateClasses}`}
              aria-label={`Go to question ${i + 1}`}
            >
              {i + 1}
              {isMarked && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
})

QuestionTracker.displayName = 'QuestionTracker'
