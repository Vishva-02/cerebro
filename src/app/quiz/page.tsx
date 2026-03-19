'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { AnimatedBackground } from '@/components/quiz/AnimatedBackground'
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
      <div className="relative mx-auto max-w-6xl">
        <AnimatedBackground />
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <div className="glass-card p-4 lg:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-4 w-28 skeleton rounded-lg" />
              <div className="h-4 w-18 skeleton rounded-lg" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="skeleton aspect-square rounded-xl" />
              ))}
            </div>
          </div>

          <div className="glass-card p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="skeleton h-5 w-52 rounded-lg" />
              <div className="skeleton h-5 w-24 rounded-lg" />
            </div>
            <div className="skeleton h-10 w-full rounded-xl mb-6" />
            <div className="space-y-3 mb-8">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
            <div className="flex justify-between gap-4">
              <div className="skeleton h-12 w-28 rounded-full" />
              <div className="skeleton h-12 w-36 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentMarked = Boolean(markedMap[currentIndex])
  if (!currentQuestion) return null

  const questionSlideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 28 : -28,
      filter: 'blur(6px)',
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -28 : 28,
      filter: 'blur(6px)',
    }),
  }

  return (
    <div className="relative mx-auto max-w-6xl">
      <AnimatedBackground />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* Left tracker */}
        <aside className="lg:sticky lg:top-24 self-start">
          <QuestionTracker
            count={totalQuestions}
            currentIndex={currentIndex}
            answers={session.answers}
            marked={markedMap}
            onSelect={goToQuestion}
          />

          {/* Small summary */}
          <div className="glass-card mt-4 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/85">Progress</p>
              <p className="text-sm text-slate-300/75">{Math.round(progress)}%</p>
            </div>
            <div className="mt-3">
              <ProgressBar progress={progress} />
            </div>
          </div>
        </aside>

        {/* Right main quiz */}
        <div className="space-y-6">
          {/* Header */}
          <div className="glass-card p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white/95">
                  Question {currentIndex + 1} / {totalQuestions}
                </h1>
                <p className="text-sm text-slate-300/70">
                  Choose the best answer. Mark questions for review.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleMarked(currentIndex)}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border transition-all duration-300 ease-in-out ${
                    currentMarked
                      ? 'border-yellow-400/60 bg-yellow-400/10 text-yellow-100 shadow-[0_0_22px_rgba(250,204,21,0.25)]'
                      : 'border-white/15 bg-white/5 text-slate-200/80 hover:bg-white/10'
                  }`}
                >
                  {currentMarked ? 'Marked' : 'Mark for review'}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Question + options (animated switch) */}
          <AnimatePresence custom={transitionDir} mode="wait">
            <motion.div
              key={currentQuestion?.id ?? currentIndex}
              custom={transitionDir}
              variants={questionSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: 'easeInOut' }}
              className="glass-card p-6 lg:p-8"
            >
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="text-xl sm:text-2xl font-semibold text-white/95 leading-relaxed"
              >
                {currentQuestion.text}
              </motion.h2>

              <div className="mt-6 grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, index) => {
                  const selected = selectedAnswer === index
                  const letter = String.fromCharCode(65 + index)

                  const optionBase =
                    'w-full text-left rounded-2xl border px-4 py-4 transition-all duration-300 ease-in-out'

                  const optionState = selected
                    ? 'border-indigo-400/60 bg-indigo-400/10 shadow-[0_0_28px_rgba(99,102,241,0.35)]'
                    : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25'

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${optionBase} ${optionState}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-slate-100/90 font-bold">
                          {letter}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm sm:text-base font-medium text-white/90">
                            {option}
                          </p>
                          {selected && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_14px_rgba(99,102,241,0.55)]" />
                              <p className="text-xs text-slate-300/70">
                                Selected
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  variant="secondary"
                  className="w-full sm:w-auto px-8 py-3 rounded-full"
                >
                  Previous
                </Button>

                <motion.div whileHover={{ y: -1 }} className="w-full sm:w-auto">
                  <Button
                    onClick={handleNext}
                    disabled={!hasAnswer}
                    className={`w-full px-8 py-3 rounded-full ${
                      hasAnswer ? 'shadow-pink-500/20' : ''
                    }`}
                  >
                    {isLastQuestion ? 'Finish Quiz' : 'Next'}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer micro UX */}
          <div className="text-center text-sm text-slate-300/70">
            {answeredCount} of {totalQuestions} answered
          </div>
        </div>
      </div>
    </div>
  )
}
