'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import type { Question } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

interface QuizFormData {
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
  hasTimer: boolean
  timerMinutes: number
  hasNegativeMarking: boolean
  negativeMarksPerWrong: number
}

const QUOTES = [
  "Push yourself, because no one else is going to do it for you.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Focus on your goal. Don't look in any direction but ahead.",
  "The secret of getting ahead is getting started."
]

export default function Home() {
  const router = useRouter()
  const { setQuestions, setIsLoading, setError } = useQuizStore()

  const [showForm, setShowForm] = useState(false)
  const [quote, setQuote] = useState(QUOTES[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setFormError] = useState<string | null>(null)

  const [formData, setFormData] = useState<QuizFormData>({
    topic: '',
    difficulty: 'easy',
    count: 10,
    hasTimer: false,
    timerMinutes: 10,
    hasNegativeMarking: false,
    negativeMarksPerWrong: 1,
  })

  // Rotate quotes
  useEffect(() => {
    if (showForm) return
    const interval = setInterval(() => {
      setQuote(q => {
        const idx = QUOTES.indexOf(q)
        return QUOTES[(idx + 1) % QUOTES.length]
      })
    }, 6000)
    return () => clearInterval(interval)
  }, [showForm])

  const handleStartQuiz = () => setShowForm(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.topic.trim()) {
      setFormError('Please enter a topic')
      return
    }

    if (formData.count < 5 || formData.count > 50) {
      setFormError('Number of questions must be between 5 and 50')
      return
    }

    if (formData.hasTimer && formData.timerMinutes < 1) {
      setFormError('Timer must be at least 1 minute')
      return
    }

    if (formData.hasNegativeMarking && formData.negativeMarksPerWrong < 1) {
      setFormError('Negative marks must be at least 1')
      return
    }

    setFormError(null)
    setIsGenerating(true)
    setIsLoading(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.topic,
          difficulty: formData.difficulty,
          count: formData.count
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      const data = await response.json()
      const questions: Question[] = data.questions

      setQuestions(
        questions,
        formData.topic,
        formData.difficulty,
        formData.hasTimer ? formData.timerMinutes : undefined,
        formData.hasNegativeMarking,
        formData.hasNegativeMarking ? formData.negativeMarksPerWrong : undefined
      )

      router.push('/quiz')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setFormError(message)
      setError(message)
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }

  // --- RENDERS ---

  if (!showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center space-y-12 my-auto"
      >
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-textMain">
          CEREBRO
        </h1>

        <div className="h-20 flex items-center justify-center px-4 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="text-lg md:text-xl text-slate-400 italic"
            >
              &quot;{quote}&quot;
            </motion.p>
          </AnimatePresence>
        </div>

        <button
          onClick={handleStartQuiz}
          className="btn-primary text-lg !px-12 !py-4 rounded-full mt-4"
        >
          Start Quiz
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card p-8 md:p-10">
        <h2 className="text-3xl font-bold text-textMain mb-8 text-center tracking-tight">
          Configure Your Session
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* TOPIC */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-primary uppercase tracking-wider">
              1. Select Topic
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={e => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Computer Science, Biology, Pop Culture..."
              className="input-field"
              disabled={isGenerating}
              required
            />
          </div>

          {/* DIFFICULTY */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-primary uppercase tracking-wider">
              2. Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: level as 'easy' | 'medium' | 'hard' })}
                  className={`py-3 rounded-xl border font-medium capitalize transition-all duration-200 ${formData.difficulty === level
                    ? 'bg-primary text-slate-900 border-primary shadow-lg shadow-primary/20'
                    : 'bg-surface text-slate-300 border-slate-700 hover:border-primary/50'
                    }`}
                  disabled={isGenerating}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* NUMBER OF QUESTIONS */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm font-semibold text-primary uppercase tracking-wider">
              <span>3. Number of Questions</span>
              <input
                type="number"
                min="5"
                max="50"
                value={formData.count}
                onChange={e => setFormData({ ...formData, count: parseInt(e.target.value) || 5 })}
                className="w-16 text-center bg-surface border border-slate-700 rounded-md text-textMain focus:outline-none focus:border-primary py-1"
                disabled={isGenerating}
              />
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={formData.count}
              onChange={e => setFormData({ ...formData, count: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={isGenerating}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* TIMER OPTION */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-800/30 border border-slate-700">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Timer
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasTimer: !formData.hasTimer })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.hasTimer ? 'bg-primary' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hasTimer ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {formData.hasTimer && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-3">
                  <label className="block text-xs text-slate-400 mb-3">Minutes limit</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, timerMinutes: Math.max(1, formData.timerMinutes - 1) })}
                      className="w-10 h-10 rounded-lg bg-surface border border-slate-700 text-textMain flex items-center justify-center hover:border-primary hover:text-primary transition-colors font-bold text-xl"
                      disabled={isGenerating}
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-textMain w-12 text-center">
                      {formData.timerMinutes}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, timerMinutes: formData.timerMinutes + 1 })}
                      className="w-10 h-10 rounded-lg bg-surface border border-slate-700 text-textMain flex items-center justify-center hover:border-primary hover:text-primary transition-colors font-bold text-xl"
                      disabled={isGenerating}
                    >
                      +
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* NEGATIVE MARKING OPTION */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-800/30 border border-slate-700">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Negative Marks
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasNegativeMarking: !formData.hasNegativeMarking })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.hasNegativeMarking ? 'bg-error' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hasNegativeMarking ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {formData.hasNegativeMarking && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-3">
                  <label className="block text-xs text-slate-400 mb-3">Deducted per wrong answer</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, negativeMarksPerWrong: Math.max(1, formData.negativeMarksPerWrong - 1) })}
                      className="w-10 h-10 rounded-lg bg-surface border border-slate-700 text-textMain flex items-center justify-center hover:border-primary hover:text-primary transition-colors font-bold text-xl"
                      disabled={isGenerating}
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-textMain w-12 text-center">
                      {formData.negativeMarksPerWrong}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, negativeMarksPerWrong: formData.negativeMarksPerWrong + 1 })}
                      className="w-10 h-10 rounded-lg bg-surface border border-slate-700 text-textMain flex items-center justify-center hover:border-primary hover:text-primary transition-colors font-bold text-xl"
                      disabled={isGenerating}
                    >
                      +
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-center gap-3">
              <span className="text-error text-xl">⚠️</span>
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="btn-primary w-full mt-4 h-14"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                Generating Brainteasers...
              </span>
            ) : (
              'Synthesize Quiz'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
