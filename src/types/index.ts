/**
 * Core types for the Quiz application
 */

export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface Quiz {
  id: string
  title: string
  description: string
  topic: string
  questions: Question[]
  timeLimit?: number // in seconds
  createdAt: Date
  updatedAt: Date
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId?: string
  answers: number[]
  score: number
  percentage: number
  completedAt: Date
  timeSpent: number // in seconds
}

export interface QuizResult {
  score: number
  percentage: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  timeSpent: number
  answers: Array<{
    questionId: string
    selectedAnswer: number
    isCorrect: boolean
  }>
}

export interface AppError {
  code: string
  message: string
  details?: unknown
}

export interface QuizSession {
  questions: Question[]
  currentQuestionIndex: number
  selectedAnswers: number[]
  startTime: Date
  endTime: Date | null
  isCompleted: boolean
}
