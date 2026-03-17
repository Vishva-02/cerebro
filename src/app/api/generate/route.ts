import { NextRequest, NextResponse } from 'next/server'
import type { GenerateQuizRequest } from '@/lib/openai'
import { generateQuizQuestions } from '@/lib/openai'

const validateRequestBody = (
  body: unknown
): body is GenerateQuizRequest => {
  if (typeof body !== 'object' || body === null) return false
  const candidate = body as Record<string, unknown>

  const topic = candidate.topic
  const difficulty = candidate.difficulty
  const count = candidate.count

  return (
    typeof topic === 'string' &&
    topic.trim().length > 0 &&
    (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') &&
    typeof count === 'number' &&
    Number.isInteger(count) &&
    count > 0 &&
    count <= 20
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    if (!validateRequestBody(body)) {
      return NextResponse.json(
        {
          error: 'Invalid request payload. Expected { topic, difficulty, count }',
        },
        { status: 400 }
      )
    }

    const result = await generateQuizQuestions(body)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown server error'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
