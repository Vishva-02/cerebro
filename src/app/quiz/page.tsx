'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { QuestionTracker } from '@/components/quiz/QuestionTracker'

export default function QuizPage() {
  const router = useRouter()
  const {
    session,
    answerQuestion,
    toggleMarked,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    finishQuiz,
  } = useQuizStore()

  // Redirect if no session
  useEffect(() => {
    if (!session || session.questions.length === 0) {
      router.push('/')
    }
  }, [session, router])

  const markedMap = session?.marked ?? {}
  const isLoading = !session || session.questions.length === 0
  const currentIndex = session?.currentQuestionIndex ?? 0

  const currentQuestion = session?.questions?.[currentIndex]
  const selectedAnswer = session?.answers?.[currentIndex]
  const isLastQuestion = currentIndex === (session?.questions?.length ?? 1) - 1
  const hasAnswer = selectedAnswer !== undefined

  const answeredCount = useMemo(() => {
    if (!session) return 0
    return Object.keys(session.answers).length
  }, [session])

  const totalQuestions = session?.questions.length ?? 0
  const progress = useMemo(() => {
    if (!session || totalQuestions === 0) return 0
    return ((currentIndex + 1) / totalQuestions) * 100
  }, [session, totalQuestions, currentIndex])

  const lastIndexRef = useRef(currentIndex)
  const transitionDir = currentIndex >= lastIndexRef.current ? 1 : -1

  useEffect(() => {
    if (!session) return
    lastIndexRef.current = currentIndex
  }, [currentIndex, session])

  // Timer Logic
  const timeLimitMs = session?.timeLimit ? session.timeLimit * 60 * 1000 : null
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimitMs)

  useEffect(() => {
    if (timeLimitMs === null || !session?.startTime || session.isCompleted) return

    const tick = () => {
      const elapsed = Date.now() - new Date(session.startTime).getTime()
      const remaining = Math.max(0, timeLimitMs - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        finishQuiz()
        router.push('/results')
      }
    }

    tick()
    const timerId = setInterval(tick, 1000)
    return () => clearInterval(timerId)
  }, [timeLimitMs, session?.startTime, session?.isCompleted, finishQuiz, router])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getTimerColorClass = () => {
    if (timeLeft === null || timeLimitMs === null) return 'text-primary'
    const ratio = timeLeft / timeLimitMs
    if (ratio > 0.5) return 'text-primary'
    if (ratio > 0.2) return 'text-warning'
    return 'text-error animate-pulse font-bold'
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!session) return
    answerQuestion(currentIndex, answerIndex)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      finishQuiz()
      router.push('/results')
    } else {
      nextQuestion()
    }
  }

  const handlePrevious = () => {
    prevQuestion()
  }

  if (isLoading) {
    return (
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  const currentMarked = Boolean(markedMap[currentIndex])
  if (!currentQuestion) return null

  const questionSlideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 20 : -20 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -20 : 20 }),
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">

        {/* Left tracker */}
        <aside className="lg:sticky lg:top-24 self-start space-y-6">
          <QuestionTracker
            count={totalQuestions}
            currentIndex={currentIndex}
            answers={session.answers}
            marked={markedMap}
            onSelect={goToQuestion}
          />

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Progress</p>
              <p className="text-sm font-bold text-primary">{Math.round(progress)}%</p>
            </div>
            <ProgressBar progress={progress} />
            <div className="mt-4 text-center text-xs text-slate-400">
              {answeredCount} of {totalQuestions} answered
            </div>
          </div>
        </aside>

        {/* Right main quiz */}
        <div className="flex flex-col space-y-6">

          {/* Header */}
          <div className="glass-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-md bg-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <h1 className="text-lg text-slate-300">
                Choose the best answer below.
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-sm text-slate-400">⏱ Time:</span>
                  <span className={`text-lg tracking-wider font-mono ${getTimerColorClass()}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleMarked(currentIndex)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${currentMarked
                    ? 'border-warning/50 bg-warning/10 text-warning'
                    : 'border-slate-600 bg-transparent text-slate-400 hover:border-slate-400 hover:text-slate-200'
                  }`}
              >
                {currentMarked ? '📍 Marked' : 'Mark for review'}
              </motion.button>
            </div>
          </div>

          {/* Question + options (animated switch) */}
          <div className="glass-card p-6 sm:p-10 flex-grow">
            <AnimatePresence custom={transitionDir} mode="wait">
              <motion.div
                key={currentQuestion?.id ?? currentIndex}
                custom={transitionDir}
                variants={questionSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-textMain leading-snug mb-8">
                  {currentQuestion.text}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option, index) => {
                    const selected = selectedAnswer === index
                    const letter = String.fromCharCode(65 + index)

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left rounded-2xl border px-5 py-4 transition-all duration-300 ${selected
                            ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                            : 'border-slate-700 bg-surface hover:border-slate-500 hover:bg-slate-800/80'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-xl font-bold ${selected ? 'bg-primary text-slate-900' : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                            {letter}
                          </div>
                          <p className={`text-base font-medium ${selected ? 'text-primary' : 'text-slate-200'}`}>
                            {option}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Navigation */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-700/50 pt-8">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    variant="secondary"
                    className="w-full sm:w-auto px-8"
                  >
                    Previous
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!hasAnswer && !isLastQuestion} // Allows finishing even if not all answered
                    className="w-full sm:w-auto px-10 btn-primary"
                  >
                    {isLastQuestion ? 'Submit Final Quiz' : 'Next Question'}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  )
}
