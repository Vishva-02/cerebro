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
      try {
        // TODO: Fetch quiz from API
        // const quiz = await fetchQuiz(quizId)
        // setCurrentQuiz(quiz)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setError(message)
      }
    },
    [setCurrentQuiz, setError]
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

/**
 * Hook for managing quiz attempts and results
 */
export const useQuizAttempt = () => {
  const { currentAttempt, startAttempt, endAttempt } = useQuizStore()

  const begin = useCallback(
    (quizId: string, userId?: string) => {
      startAttempt(quizId, userId)
    },
    [startAttempt]
  )

  const complete = useCallback(
    (result) => {
      endAttempt(result)
    },
    [endAttempt]
  )

  return {
    currentAttempt,
    begin,
    complete,
  }
}
