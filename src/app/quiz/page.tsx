'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { Card } from '@/components/common/Card'

export default function QuizPage() {
  const router = useRouter()
  const {
    session,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    finishQuiz,
    resetSession,
  } = useQuizStore()

  // Redirect if no session
  useEffect(() => {
    if (!session || session.questions.length === 0) {
      router.push('/')
    }
  }, [session, router])

  if (!session || session.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = session.questions[session.currentQuestionIndex]
  const selectedAnswer = session.answers[session.currentQuestionIndex]
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1
  const hasAnswer = selectedAnswer !== undefined

  const answeredCount = Object.keys(session.answers).length
  const totalQuestions = session.questions.length
  const progress = ((session.currentQuestionIndex + 1) / totalQuestions) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    answerQuestion(session.currentQuestionIndex, answerIndex)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      finishQuiz()
      router.push('/results')
    } else {
      nextQuestion()
    }
  }

  const handlePrevious = () => {
    prevQuestion()
  }


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-slate-600">
            Question {session.currentQuestionIndex + 1} of {session.questions.length}
          </span>
          <span className="text-sm text-slate-500">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <ProgressBar progress={progress} />
      </div>

      {/* Question Card */}
      <Card className="p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === index
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-medium mr-3 text-slate-400">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={session.currentQuestionIndex === 0}
            variant="secondary"
            className="px-6"
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="px-6"
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next'}
          </Button>
        </div>
      </Card>

      {/* Question Counter */}
      <div className="text-center text-sm text-slate-500">
        {answeredCount} of {totalQuestions} questions answered
      </div>
    </div>
  )
}
