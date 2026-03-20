'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { QuestionTracker } from '@/components/quiz/QuestionTracker'
import { ProctoringMonitor } from '@/components/quiz/ProctoringMonitor'
import { ProctoringConsent } from '@/components/quiz/ProctoringConsent'

export default function QuizPage() {
  const router = useRouter()
  const { status } = useSession()
  const {
    session,
    answerQuestion,
    toggleMarked,
    goToQuestion,
    nextQuestion,
    prevQuestion, // Renamed to previousQuestion in the instruction's proposed destructuring, but keeping original for now based on context
    skipQuestion,
    finishQuiz,
    startSession,
  } = useQuizStore()

  const [hasConsented, setHasConsented] = useState(false)


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
  const [isTimeUp, setIsTimeUp] = useState(false)

  useEffect(() => {
    if (timeLimitMs === null || !session?.startTime || session.isCompleted) return

    const tick = () => {
      const elapsed = Date.now() - new Date(session.startTime).getTime()
      const remaining = Math.max(0, timeLimitMs - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        setIsTimeUp(true)
      }
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [timeLimitMs, session?.startTime, session?.isCompleted])

  // Effect to call finishQuiz when time is up
  useEffect(() => {
    if (isTimeUp) {
      finishQuiz()
      router.push('/results')
    }
  }, [isTimeUp, finishQuiz, router])

  // --- HEARTBEAT / SESSION PERSISTENCE ---
  useEffect(() => {
    if (!session || session.isCompleted || !timeLeft) return

    const saveSession = async () => {
      if (status !== 'authenticated') return
      try {
        await fetch('/api/quiz/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: session.topic,
            difficulty: session.difficulty,
            currentQuestionIndex: session.currentQuestionIndex,
            answers: session.answers,
            timeLeft: Math.floor(timeLeft / 1000), // Save in seconds
            status: 'in-progress'
          })
        })
      } catch (err) {
        console.error('Heartbeat failed:', err)
      }
    }

    const interval = setInterval(saveSession, 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.currentQuestionIndex, session?.isCompleted, timeLeft, session?.topic, session?.difficulty, session?.answers])


  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getTimerColorClass = () => {
    if (timeLeft === null || timeLimitMs === null) return 'bg-slate-800 text-primary border-slate-700'
    const ratio = timeLeft / timeLimitMs
    if (ratio > 0.5) return 'bg-slate-800 text-primary border-slate-700'
    if (ratio > 0.2) return 'bg-orange-500/20 text-orange-400 border-orange-500/40'
    return 'bg-error text-white font-bold animate-pulse border-error shadow-[0_0_20px_rgba(239,68,68,0.5)]'
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!session) return
    answerQuestion(currentIndex, answerIndex)
  }

  const handleFinish = async () => {
    // 1. Mark as finished in local store first for immediate UI update
    finishQuiz()

    // 2. Persist to DB if authenticated
    const results = useQuizStore.getState().attempts.slice(-1)[0] // Get the last attempt

    if (results && status === 'authenticated') {
      try {
        await fetch('/api/quiz/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: results.topic,
            difficulty: results.difficulty,
            score: results.score,
            totalQuestions: results.questionCount,
            percentage: results.percentage,
            timeSpent: results.timeSpent,
          }),
        })
      } catch (error) {
        console.error('Failed to save attempt to DB:', error)
      }
    }

    setIsTimeUp(false)
    router.push('/results')
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleFinish()
    } else {
      nextQuestion()
    }
  }

  const handleSkip = () => {
    skipQuestion(currentIndex)
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

  if (!hasConsented) {
    return <ProctoringConsent onConsent={() => {
      setHasConsented(true)
      startSession()
    }} />
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <ProctoringMonitor />
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">

        {/* Left tracker */}
        <aside className="lg:sticky lg:top-24 self-start space-y-6">
          <QuestionTracker
            count={totalQuestions}
            currentIndex={currentIndex}
            answers={session.answers}
            marked={markedMap}
            skipped={session.explicitlySkipped ?? {}}
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
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${getTimerColorClass()}`}>
                  <span className="text-sm opacity-80">⏱ Time:</span>
                  <span className="text-lg tracking-wider font-mono">
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

                  <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                    <Button
                      onClick={handleSkip}
                      variant="secondary"
                      className="w-full sm:w-auto px-8 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold tracking-wide"
                    >
                      {isLastQuestion ? 'Skip and Finish' : 'Skip Question'}
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!hasAnswer}
                      className="w-full sm:w-auto px-10 btn-primary"
                    >
                      {isLastQuestion ? 'Submit Final Quiz' : 'Next Question'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Time Up Modal */}
      <AnimatePresence>
        {isTimeUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-10 max-w-sm w-full text-center flex flex-col items-center justify-center space-y-6 shadow-2xl shadow-error/20 border-error/50"
            >
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error text-3xl mb-2">
                ⏱️
              </div>
              <h2 className="text-3xl font-extrabold text-white">Time is over!</h2>
              <p className="text-slate-300">Your current answers have been saved.</p>
              <Button
                onClick={() => router.push('/results')}
                className="btn-primary w-full h-12 mt-4"
              >
                View Results
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
