import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Quiz, QuizAttempt, QuizResult, QuizSession, Question } from '@/types'

/**
 * Zustand store for managing quiz state globally
 * Uses devtools for debugging and persist for localStorage
 */

interface QuizStore {
  // State
  quizzes: Quiz[]
  currentQuiz: Quiz | null
  attempts: QuizAttempt[]
  currentAttempt: QuizAttempt | null
  isLoading: boolean
  error: string | null

  // Quiz session state
  session: QuizSession | null

  // Actions
  setCurrentQuiz: (quiz: Quiz | null) => void
  addQuiz: (quiz: Quiz) => void
  removeQuiz: (quizId: string) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  startAttempt: (quizId: string, userId?: string) => void
  endAttempt: (result: QuizResult) => void
  resetStore: () => void

  // Quiz session actions
  setQuestions: (questions: Question[]) => void
  answerQuestion: (questionIndex: number, answerIndex: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  finishQuiz: () => void
  resetSession: () => void
}

const initialState = {
  quizzes: [],
  currentQuiz: null,
  attempts: [],
  currentAttempt: null,
  isLoading: false,
  error: null,
  session: null,
}

export const useQuizStore = create<QuizStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),

        addQuiz: (quiz) =>
          set((state) => ({
            quizzes: [...state.quizzes, quiz],
          })),

        removeQuiz: (quizId) =>
          set((state) => ({
            quizzes: state.quizzes.filter((q) => q.id !== quizId),
          })),

        setIsLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        startAttempt: (quizId, userId) =>
          set({
            currentAttempt: {
              id: Math.random().toString(36).substr(2, 9),
              quizId,
              userId,
              answers: [],
              score: 0,
              percentage: 0,
              completedAt: new Date(),
              timeSpent: 0,
            },
          }),

        endAttempt: (result) =>
          set((state) => ({
            currentAttempt: null,
            attempts: [
              ...state.attempts,
              {
                id: state.currentAttempt?.id || '',
                quizId: state.currentAttempt?.quizId || '',
                userId: state.currentAttempt?.userId,
                answers: result.answers.map((a) => a.selectedAnswer),
                score: result.score,
                percentage: result.percentage,
                completedAt: new Date(),
                timeSpent: result.timeSpent,
              },
            ],
          })),

        resetStore: () => set(initialState),
      }),
      {
        name: 'quiz-storage', // localStorage key
      }
    )
  )
)
