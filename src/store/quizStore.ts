import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Quiz, QuizAttempt, QuizSession, Question } from '@/types'

/**
 * Zustand store for managing quiz state globally
 * Uses devtools for debugging and persist for localStorage
 */

interface QuizStore {
  // State
  quizzes: Quiz[]
  currentQuiz: Quiz | null
  attempts: QuizAttempt[]
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
  resetStore: () => void

  // Quiz session actions
  setQuestions: (questions: Question[], topic: string, difficulty: 'easy' | 'medium' | 'hard', timeLimit?: number, negativeMarking?: boolean, negativeMarksPerWrong?: number) => void
  answerQuestion: (questionIndex: number, answerIndex: number) => void
  toggleMarked: (questionIndex: number) => void
  goToQuestion: (questionIndex: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  skipQuestion: (questionIndex: number) => void
  finishQuiz: () => void
  retakeAttempt: (attemptId: string) => void
  resetSession: () => void
}

const initialState = {
  quizzes: [],
  currentQuiz: null,
  attempts: [],
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

        resetStore: () => set(initialState),

        // Quiz session actions
        setQuestions: (questions, topic, difficulty, timeLimit, negativeMarking, negativeMarksPerWrong) =>
          set({
            session: {
              questions,
              topic,
              difficulty,
              currentQuestionIndex: 0,
              answers: {}, // Reset answers when starting a new quiz
              marked: {}, // Reset marks when starting a new quiz
              explicitlySkipped: {}, // Reset skips
              startTime: new Date(),
              endTime: null,
              isCompleted: false,
              timeLimit,
              negativeMarking,
              negativeMarksPerWrong,
            },
          }),

        answerQuestion: (questionIndex, answerIndex) =>
          set((state) => {
            if (!state.session) return state
            const newAnswers = {
              ...state.session.answers,
              [questionIndex]: answerIndex,
            }
            const newSkipped = { ...state.session.explicitlySkipped }
            delete newSkipped[questionIndex]

            return {
              session: {
                ...state.session,
                answers: newAnswers,
                explicitlySkipped: newSkipped,
              },
            }
          }),

        toggleMarked: (questionIndex) =>
          set((state) => {
            if (!state.session) return state
            const next = !state.session.marked?.[questionIndex]
            return {
              session: {
                ...state.session,
                marked: {
                  ...(state.session.marked ?? {}),
                  [questionIndex]: next,
                },
              },
            }
          }),

        goToQuestion: (questionIndex) =>
          set((state) => {
            if (!state.session) return state
            const bounded = Math.min(
              Math.max(questionIndex, 0),
              state.session.questions.length - 1
            )
            return {
              session: {
                ...state.session,
                currentQuestionIndex: bounded,
              },
            }
          }),

        nextQuestion: () =>
          set((state) => {
            if (!state.session) return state
            const nextIndex = Math.min(
              state.session.currentQuestionIndex + 1,
              state.session.questions.length - 1
            )
            return {
              session: {
                ...state.session,
                currentQuestionIndex: nextIndex,
              },
            }
          }),

        prevQuestion: () =>
          set((state) => {
            if (!state.session) return state
            const prevIndex = Math.max(state.session.currentQuestionIndex - 1, 0)
            return {
              session: {
                ...state.session,
                currentQuestionIndex: prevIndex,
              },
            }
          }),

        skipQuestion: (questionIndex) =>
          set((state) => {
            if (!state.session) return state
            const newAnswers = { ...state.session.answers }
            delete newAnswers[questionIndex]

            return {
              session: {
                ...state.session,
                answers: newAnswers,
                explicitlySkipped: {
                  ...(state.session.explicitlySkipped ?? {}),
                  [questionIndex]: true,
                },
              },
            }
          }),

        finishQuiz: () =>
          set((state) => {
            if (!state.session) return state

            const endTime = new Date()
            const timeSpentSeconds = Math.round(
              (endTime.getTime() - state.session.startTime.getTime()) / 1000
            )

            const correctCount = state.session.questions.reduce((count, question, index) => {
              const answer = state.session?.answers[index]
              return count + (answer === question.correctAnswer ? 1 : 0)
            }, 0)

            const answeredCount = Object.keys(state.session.answers).length
            const wrongCount = answeredCount - correctCount

            const skippedCount = Object.keys(state.session.explicitlySkipped ?? {}).length
            const notAnsweredCount = state.session.questions.length - answeredCount - skippedCount

            let negativeMarksDeducted = 0
            if (state.session.negativeMarking && state.session.negativeMarksPerWrong) {
              negativeMarksDeducted = wrongCount * state.session.negativeMarksPerWrong
            }

            const finalScore = Math.max(0, correctCount - negativeMarksDeducted)

            const percentage = state.session.questions.length
              ? Math.round((correctCount / state.session.questions.length) * 100)
              : 0

            const attempt: QuizAttempt = {
              id: `attempt-${Date.now()}`,
              quizId: `quiz-${state.session.topic}-${state.session.difficulty}`,
              topic: state.session.topic,
              difficulty: state.session.difficulty,
              questionCount: state.session.questions.length,
              questions: state.session.questions,
              answers: state.session.answers,
              score: correctCount,
              finalScore,
              negativeMarksDeducted,
              skippedCount,
              notAnsweredCount,
              percentage,
              completedAt: endTime,
              timeSpent: timeSpentSeconds,
            }

            return {
              session: {
                ...state.session,
                endTime,
                isCompleted: true,
              },
              attempts: [...state.attempts, attempt],
            }
          }),

        retakeAttempt: (attemptId) =>
          set((state) => {
            const attempt = state.attempts.find((a) => a.id === attemptId)
            if (!attempt) return state
            return {
              session: {
                questions: attempt.questions,
                topic: attempt.topic,
                difficulty: attempt.difficulty,
                currentQuestionIndex: 0,
                answers: {},
                marked: {},
                explicitlySkipped: {},
                startTime: new Date(),
                endTime: null,
                isCompleted: false,
              },
            }
          }),

        resetSession: () => set({ session: null }),
      }),
      {
        name: 'quiz-storage', // localStorage key
      }
    )
  )
)
