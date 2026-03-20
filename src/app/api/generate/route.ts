import { NextRequest, NextResponse } from 'next/server'
import type { GenerateQuizRequest } from '@/lib/openai'
import { generateQuizQuestions } from '@/lib/openai'

// ✅ Validate request body
const validateRequestBody = (
  body: unknown
): body is GenerateQuizRequest => {
  if (typeof body !== 'object' || body === null) return false

  const candidate = body as Record<string, unknown>

  return (
    typeof candidate.topic === 'string' &&
    candidate.topic.trim().length > 0 &&
    (candidate.difficulty === 'easy' ||
      candidate.difficulty === 'medium' ||
      candidate.difficulty === 'hard') &&
    typeof candidate.count === 'number' &&
    Number.isInteger(candidate.count) &&
    candidate.count > 0 &&
    candidate.count <= 50
  )
}

// ✅ POST API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    // ❌ Invalid input
    if (!validateRequestBody(body)) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      )
    }

    // 🔥 Call AI provider logic
    const result = await generateQuizQuestions(body)

    // ❗ Safety check
    if (!result || !result.questions) {
      return NextResponse.json(
        { error: 'Failed to generate questions' },
        { status: 500 }
      )
    }

    // ✅ Success response
    return NextResponse.json(
      {
        success: true,
        questions: result.questions,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('API ERROR:', error)

    const message =
      error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}