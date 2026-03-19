'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistoryPage() {
  const router = useRouter()
  const { attempts, retakeAttempt } = useQuizStore()
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [sortBy, setSortBy] = useState<'latest' | 'highest'>('latest')

  const filtered = useMemo(() => {
    let filteredAttempts = [...attempts]

    if (difficultyFilter !== 'all') {
      filteredAttempts = filteredAttempts.filter(
        (attempt) => attempt.difficulty === difficultyFilter
      )
    }

    filteredAttempts.sort((a, b) => {
      if (sortBy === 'latest') {
        return (
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )
      }
      return b.score - a.score
    })

    return filteredAttempts
  }, [attempts, difficultyFilter, sortBy])

  const handleRetake = (attemptId: string) => {
    retakeAttempt(attemptId)
    router.push('/quiz')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Quiz History</h1>
          <p className="text-slate-400 mt-1">
            Review past quiz attempts, filter by difficulty, and retake any quiz.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="difficulty" className="text-sm font-medium text-slate-300">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as any)}
              className="select"
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-slate-700">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="select"
            >
              <option value="latest">Latest</option>
              <option value="highest">Highest score</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-600">No quiz history yet. Take a quiz to get started!</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/')}>
              Start a new quiz
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((attempt) => (
            <Card key={attempt.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{formatDate(attempt.completedAt)}</p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {attempt.topic} ({attempt.difficulty})
                  </h2>
                  <p className="text-sm text-slate-600">
                    Score: {attempt.score} / {attempt.questionCount} &middot; {attempt.percentage}%
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRetake(attempt.id)}
                    variant="secondary"
                    className="px-5"
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/results')
                    }}
                    className="px-5"
                  >
                    View Results
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
