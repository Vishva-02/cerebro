/**
 * Custom hooks for the Quiz application
 */

'use client'

import { useCallback } from 'react'
import { useQuizStore } from '@/store/quizStore'

/**
 * Hook for managing quiz navigation and state
 */
export const useQuizNavigation = () => {
  const { currentQuiz, setCurrentQuiz, setError } = useQuizStore()

  const selectQuiz = useCallback(
    (quizId: string) => {
      // This hook is currently a stub; keep the parameter to preserve the API.
      void quizId
      try {
        // TODO: Fetch quiz from API
        // const quiz = await fetchQuiz(quizId)
        // setCurrentQuiz(quiz)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setError(message)
      }
    },
    [setError]
  )

  const clearCurrentQuiz = useCallback(() => {
    setCurrentQuiz(null)
  }, [setCurrentQuiz])

  return {
    currentQuiz,
    selectQuiz,
    clearCurrentQuiz,
  }
}

