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
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionCount: number
  questions: Question[]
  answers: Record<number, number>
  score: number // Correct answers
  finalScore: number // Score after deductions
  negativeMarksDeducted: number
  skippedCount: number
  notAnsweredCount: number
  percentage: number
  completedAt: Date
  timeSpent: number // in seconds
  proctoring?: ProctoringData
}

export interface ProctoringData {
  focusScore: number
  violations: ProctoringViolation[]
  tabSwitches: number
  faceMissingSeconds: number
  multipleFacesDetected: boolean
}

export interface ProctoringViolation {
  type: 'tab_switch' | 'face_missing' | 'multiple_faces' | 'gaze_away' | 'fast_answer'
  timestamp: Date
  details?: string
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
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  currentQuestionIndex: number
  answers: Record<number, number>
  // Questions the user explicitly flagged for later review.
  marked: Record<number, boolean>
  // Questions the user explicitly skipped
  explicitlySkipped: Record<number, boolean>
  startTime: Date
  endTime: Date | null
  isCompleted: boolean
  timeLimit?: number // in minutes
  negativeMarking?: boolean
  negativeMarksPerWrong?: number
  proctoring?: ProctoringData
}
