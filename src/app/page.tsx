'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import type { Question } from '@/types'

interface QuizFormData {
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
}

export default function Home() {
  const router = useRouter()
  const { setQuestions, setIsLoading, setError } = useQuizStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<QuizFormData>({
    topic: '',
    difficulty: 'easy',
    count: 10,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setFormError] = useState<string | null>(null)

  const handleStartQuiz = () => {
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.topic.trim()) {
      setFormError('Please enter a topic')
      return
    }

    if (formData.count < 5 || formData.count > 20) {
      setFormError('Number of questions must be between 5 and 20')
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
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      const data = await response.json()
      const questions: Question[] = data.questions

      // Store questions in Zustand
      setQuestions(questions, formData.topic, formData.difficulty)

      // Navigate to quiz page
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'count'
          ? Number.isFinite(parseInt(value, 10))
            ? parseInt(value, 10)
            : prev.count
          : value,
    }))
  }

  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-3xl font-bold text-gradient mb-6 text-center">
            Create Your Quiz
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Input */}
            <div>
              <label
                htmlFor="topic"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Topic
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="e.g., JavaScript, World History, Biology"
                className="input-field"
                disabled={isGenerating}
                required
              />
            </div>

            {/* Difficulty Dropdown */}
            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Difficulty Level
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="select"
                disabled={isGenerating}
              >
                <option value="easy">Easy - Basic concepts and simple questions</option>
                <option value="medium">Medium - Intermediate knowledge required</option>
                <option value="hard">Hard - Advanced understanding needed</option>
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label
                htmlFor="count"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Number of Questions (5-20)
              </label>
              <input
                type="number"
                id="count"
                name="count"
                value={formData.count}
                onChange={handleInputChange}
                min={5}
                max={20}
                className="input-field"
                disabled={isGenerating}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Quiz...
                </>
              ) : (
                'Start Quiz'
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Welcome Card */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gradient mb-4">Welcome!</h2>
        <p className="text-slate-600 mb-6">
          Create and take AI-powered quizzes on any topic. Perfect for learning
          and skill assessment.
        </p>
        <button onClick={handleStartQuiz} className="btn-primary w-full">
          Start New Quiz
        </button>
      </div>

      {/* Features Card */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gradient mb-4">Features</h2>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-center gap-2">
            <span className="text-success text-xl">✓</span>
            AI-generated questions
          </li>
          <li className="flex items-center gap-2">
            <span className="text-success text-xl">✓</span>
            Real-time feedback
          </li>
          <li className="flex items-center gap-2">
            <span className="text-success text-xl">✓</span>
            Detailed results
          </li>
          <li className="flex items-center gap-2">
            <span className="text-success text-xl">✓</span>
            Progress tracking
          </li>
        </ul>
      </div>
    </div>
  )
}
