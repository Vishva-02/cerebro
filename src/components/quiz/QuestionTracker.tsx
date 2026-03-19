'use client'

import { motion } from 'framer-motion'

type Props = {
  count: number
  currentIndex: number
  answers: Record<number, number>
  marked: Record<number, boolean>
  onSelect: (index: number) => void
}

export function QuestionTracker({
  count,
  currentIndex,
  answers,
  marked,
  onSelect,
}: Props) {
  return (
    <div className="glass-card p-4 lg:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white/90">Question Tracker</h3>
          <p className="text-xs text-slate-300/70">Tap a number to jump</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-300/70">
            {Object.keys(answers).length} answered
          </p>
          <p className="text-xs text-slate-300/70">
            {Object.keys(marked).filter((k) => marked[Number(k)]).length} marked
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-6">
        {Array.from({ length: count }, (_, i) => {
          const isAnswered = answers[i] !== undefined
          const isMarked = Boolean(marked[i])
          const isCurrent = i === currentIndex

          const base =
            'relative flex aspect-square items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-300 ease-in-out'

          const stateClasses = isMarked
            ? 'border-yellow-400/55 bg-yellow-400/12 text-yellow-100 hover:bg-yellow-400/18 hover:border-yellow-400/70'
            : isAnswered
              ? 'border-emerald-400/55 bg-emerald-400/12 text-emerald-100 hover:bg-emerald-400/18 hover:border-emerald-400/70'
              : 'border-white/10 bg-white/5 text-slate-300/55 hover:bg-white/8 hover:border-white/25'

          const currentClasses = isCurrent
            ? 'ring-2 ring-indigo-400/80 border-indigo-400/70 shadow-[0_0_0_2px_rgba(99,102,241,0.35),0_0_34px_rgba(99,102,241,0.35)]'
            : ''

          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              whileHover={{
                y: -2,
                scale: isCurrent ? 1.03 : 1,
              }}
              whileTap={{ scale: 0.96 }}
              className={`${base} ${stateClasses} ${currentClasses}`}
              aria-label={`Go to question ${i + 1}`}
            >
              {i + 1}
              {isCurrent && (
                <motion.span
                  className="pointer-events-none absolute inset-0 rounded-xl bg-white/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 0.45, 0.2] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

