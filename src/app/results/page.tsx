'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'
import { useSession } from 'next-auth/react'

export default function ResultsPage() {
  const router = useRouter()
  const { session, resetSession, setQuestions } = useQuizStore()
  const { status } = useSession()

  useEffect(() => {
    if (!session || session.questions.length === 0 || !session.isCompleted) {
      router.replace('/')
    }
  }, [router, session])

  const {
    correctCount,
    wrongCount,
    answeredCount,
    skippedCount,
    notAnsweredCount,
    deductions,
    finalScore,
    percentage,
    timeTaken,
    questionResults,
    message,
  } = useMemo(() => {
    if (!session) {
      return {
        correctCount: 0,
        wrongCount: 0,
        answeredCount: 0,
        skippedCount: 0,
        notAnsweredCount: 0,
        deductions: 0,
        finalScore: 0,
        percentage: 0,
        timeTaken: 0,
        questionResults: [],
        message: '',
      }
    }

    const start = new Date(session.startTime)
    const end = new Date(session.endTime ?? new Date())
    const timeTakenMs = end.getTime() - start.getTime()

    const questionResults = session.questions.map((q, idx) => {
      const selected = session.answers[idx]
      const isCorrect = selected === q.correctAnswer
      return {
        questionText: q.text,
        options: q.options,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect,
      }
    })

    const correct = questionResults.filter((r) => r.isCorrect).length
    const answered = Object.keys(session.answers).length
    const wrong = answered - correct
    const skipped = Object.keys(session.explicitlySkipped ?? {}).length
    const notAnswered = session.questions.length - answered - skipped

    let negativePoints = 0
    if (session.negativeMarking && session.negativeMarksPerWrong) {
      negativePoints = wrong * session.negativeMarksPerWrong
    }

    const scoreAfterPenalty = Math.max(0, correct - negativePoints)
    const pct = session.questions.length ? Math.round((correct / session.questions.length) * 100) : 0

    let msg = "Keep practicing! Review the explanations below to learn more."
    if (pct >= 90) msg = "Excellent! You have a deep understanding of this topic."
    else if (pct >= 70) msg = "Good job! You did well, but there's room for improvement."

    return {
      correctCount: correct,
      wrongCount: wrong,
      answeredCount: answered,
      skippedCount: skipped,
      notAnsweredCount: notAnswered,
      deductions: negativePoints,
      finalScore: scoreAfterPenalty,
      percentage: pct,
      timeTaken: timeTakenMs,
      questionResults,
      message: msg,
    }
  }, [session])

  const handleRestart = () => {
    resetSession()
    router.push('/')
  }

  const handleRetake = () => {
    if (!session) return
    setQuestions(
      session.questions,
      session.topic,
      session.difficulty,
      session.timeLimit ?? undefined,
      session.negativeMarking,
      session.negativeMarksPerWrong
    )
    router.push('/quiz')
  }

  if (!session || session.questions.length === 0 || !session.isCompleted) {
    return null
  }

  // Circular progress math
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-16 w-full">

      {/* Header section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-textMain tracking-tight">Quiz Complete!</h1>
        <p className="text-lg text-primary font-medium">{message}</p>
      </div>

      {status !== 'authenticated' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center space-y-3"
        >
          <p className="text-textMain font-bold italic">
            &quot;Take your progress to the next level!&quot;
          </p>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            You are in <strong>Guest Mode</strong>. Sign in to save your scores, track your performance, and see where you stand on the leaderboard!
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => router.push('/signup')}
              className="text-xs font-bold bg-primary text-slate-900 px-4 py-2 rounded-lg hover:bg-white transition-colors uppercase tracking-tight"
            >
              Sign Up Now
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Stats Card */}
      <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">

        {/* Circle Chart */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96" cy="96" r={radius}
              stroke="currentColor" strokeWidth="12" fill="transparent"
              className="text-slate-800"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="96" cy="96" r={radius}
              stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeLinecap="round"
              className="text-primary"
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-textMain">{percentage}%</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Accuracy</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">Total</p>
            <p className="text-2xl font-bold text-textMain">{session.questions.length}</p>
          </div>
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">Answered</p>
            <p className="text-2xl font-bold text-textMain">{answeredCount}</p>
          </div>
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">Time</p>
            <p className="text-2xl font-bold text-textMain">{formatTime(timeTaken)}</p>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
            <p className="text-xs font-semibold tracking-wider text-[#A855F7]/80 uppercase mb-1">Skipped</p>
            <p className="text-2xl font-bold text-[#A855F7]">{skippedCount}</p>
          </div>
          <div className="bg-error/5 rounded-2xl p-4 border border-error/10">
            <p className="text-xs font-semibold tracking-wider text-error/80 uppercase mb-1">Missed</p>
            <p className="text-2xl font-bold text-error">{notAnsweredCount}</p>
          </div>
          <div className="hidden sm:block"></div> {/* Spacer for grid alignment */}

          <div className="col-span-2 sm:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            <div className="bg-success/10 rounded-2xl p-4 border border-success/20 text-center">
              <span className="block text-2xl font-bold text-success">{correctCount}</span>
              <span className="text-xs font-semibold text-success/80 uppercase">Correct</span>
            </div>
            <div className="bg-error/10 rounded-2xl p-4 border border-error/20 text-center">
              <span className="block text-2xl font-bold text-error">{wrongCount}</span>
              <span className="text-xs font-semibold text-error/80 uppercase">Wrong</span>
            </div>
            {Boolean(session.negativeMarking && session.negativeMarksPerWrong) && (
              <div className="bg-warning/10 rounded-2xl p-4 border border-warning/20 text-center col-span-2 sm:col-span-1">
                <span className="block text-2xl font-bold text-warning">-{deductions}</span>
                <span className="text-xs font-semibold text-warning/80 uppercase">Penalty</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {session.negativeMarking && session.negativeMarksPerWrong && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-textMain">Final Score: <span className="text-primary">{finalScore}</span></h2>
        </div>
      )}

      {/* Review Section */}
      <div className="space-y-6 mt-12">
        <h3 className="text-2xl font-bold text-textMain tracking-tight px-2">Review Your Answers</h3>

        {questionResults.map((question, index) => {
          const isCorrect = question.isCorrect
          const skipped = question.selectedAnswer === undefined

          return (
            <div key={index} className="glass-card p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <h4 className="text-lg md:text-xl font-bold text-textMain leading-snug">
                  <span className="text-primary mr-2">{index + 1}.</span>
                  {question.questionText}
                </h4>
                <div className="shrink-0">
                  {isCorrect ? (
                    <span className="inline-block px-3 py-1 rounded-md bg-success/20 text-success text-xs font-bold uppercase tracking-wider border border-success/30">Correct</span>
                  ) : skipped ? (
                    <span className="inline-block px-3 py-1 rounded-md bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider border border-slate-600">Skipped</span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-md bg-error/20 text-error text-xs font-bold uppercase tracking-wider border border-error/30">Incorrect</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {question.options.map((option, idx) => {
                  const isSelected = idx === question.selectedAnswer
                  const isCorrectOption = idx === question.correctAnswer

                  let stateClass = "border-slate-700/50 bg-slate-800/30 text-slate-300"

                  if (isCorrectOption) {
                    stateClass = "border-success bg-success/10 text-success font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  } else if (isSelected && !isCorrectOption) {
                    stateClass = "border-error bg-error/10 text-error font-medium"
                  } else if (isSelected) {
                    // This block isn't hit since isCorrectOption catches it, but for safety
                    stateClass = "border-primary bg-primary/10 text-primary"
                  }

                  return (
                    <div key={idx} className={`w-full text-left rounded-xl border px-5 py-3 transition-colors ${stateClass} flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <span className="font-bold shrink-0">{String.fromCharCode(65 + idx)}.</span>
                        <span>{option}</span>
                      </div>
                      {isCorrectOption && <span className="text-xl">✓</span>}
                      {isSelected && !isCorrectOption && <span className="text-xl">✕</span>}
                    </div>
                  )
                })}
              </div>

              {question.explanation && (
                <div className="mt-4 rounded-xl bg-slate-800/80 p-5 border border-slate-700 border-l-4 border-l-secondary">
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Explanation</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{question.explanation}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
        <button onClick={handleRetake} className="btn-primary !px-12 !py-4 text-lg w-full sm:w-auto">
          Retake Quiz
        </button>
        <button onClick={handleRestart} className="relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 rounded-xl px-12 py-4 text-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white w-full sm:w-auto">
          Start New Quiz
        </button>
      </div>
    </motion.div>
  )
}
