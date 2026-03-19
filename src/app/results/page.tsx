'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

export default function ResultsPage() {
  const router = useRouter()
  const { session, resetSession } = useQuizStore()

  useEffect(() => {
    // If there's no completed session, redirect to home
    if (!session || session.questions.length === 0 || !session.isCompleted) {
      router.replace('/')
    }
  }, [router, session])

  const { score, percentage, timeTaken, questionResults } = useMemo(() => {
    if (!session) {
      return {
        score: 0,
        percentage: 0,
        timeTaken: 0,
        questionResults: [] as Array<{
          questionText: string
          options: string[]
          selectedAnswer: number
          correctAnswer: number
          explanation: string
          isCorrect: boolean
        }>,
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

    const correctCount = questionResults.filter((r) => r.isCorrect).length
    const percentage = session.questions.length
      ? Math.round((correctCount / session.questions.length) * 100)
      : 0

    return {
      score: correctCount,
      percentage,
      timeTaken: timeTakenMs,
      questionResults,
    }
  }, [session])

  const handleRestart = () => {
    resetSession()
    router.push('/')
  }

  if (!session || session.questions.length === 0 || !session.isCompleted) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Quiz Results</h1>
        <p className="text-slate-600 mt-2">Here’s how you did — great work!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-slate-500">Score</p>
          <p className="text-4xl font-bold text-indigo-600">{score}</p>
          <p className="text-sm text-slate-500">out of {session.questions.length}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-500">Percentage</p>
          <p className="text-4xl font-bold text-indigo-600">{percentage}%</p>
          <p className="text-sm text-slate-500">of questions correct</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-500">Time Taken</p>
          <p className="text-4xl font-bold text-indigo-600">{formatTime(timeTaken)}</p>
          <p className="text-sm text-slate-500">from start to finish</p>
        </Card>
      </div>

      <div className="space-y-4">
        {questionResults.map((question, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {index + 1}. {question.questionText}
                </h3>
                <p
                  className={`mt-2 text-sm font-medium ${
                    question.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {question.isCorrect ? 'Correct' : 'Incorrect'}
                </p>
              </div>
              <div className="text-sm text-slate-500">
                {question.selectedAnswer >= 0
                  ? `You chose ${String.fromCharCode(65 + question.selectedAnswer)}`
                  : 'No answer selected'}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {question.options.map((option, idx) => {
                const isSelected = idx === question.selectedAnswer
                const isCorrectOption = idx === question.correctAnswer

                return (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 border flex items-center justify-between text-sm ${
                      isCorrectOption
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                        : isSelected
                        ? 'border-rose-400 bg-rose-50 text-rose-900'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="font-medium">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="flex-1 ml-2">{option}</span>
                    {isCorrectOption && (
                      <span className="ml-3 text-xs font-semibold uppercase tracking-wide">
                        ✓ Correct
                      </span>
                    )}
                    {!isCorrectOption && isSelected && (
                      <span className="ml-3 text-xs font-semibold uppercase tracking-wide">
                        ✕ Your answer
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm font-medium text-slate-700">Explanation</p>
              <p className="mt-1 text-sm text-slate-600">{question.explanation}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button onClick={handleRestart} className="px-10">
          Take another quiz
        </Button>
      </div>
    </div>
  )
}
