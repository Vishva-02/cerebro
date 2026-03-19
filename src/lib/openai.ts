import type { Question } from '@/types'

export type GenerateQuizRequest = {
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
}

export type GenerateQuizResponse = {
  questions: Question[]
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const validateQuestion = (q: unknown): q is Question => {
  if (typeof q !== 'object' || q === null) return false
  const candidate = q as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.text === 'string' &&
    Array.isArray(candidate.options) &&
    candidate.options.length === 4 &&
    candidate.options.every((opt) => typeof opt === 'string') &&
    typeof candidate.correctAnswer === 'number' &&
    candidate.correctAnswer >= 0 &&
    candidate.correctAnswer < 4 &&
    typeof candidate.explanation === 'string' &&
    (candidate.difficulty === 'easy' ||
      candidate.difficulty === 'medium' ||
      candidate.difficulty === 'hard')
  )
}

const openAIPromptTemplate = ({
  topic,
  difficulty,
  count,
}: GenerateQuizRequest): string => {
  return `You are an AI assistant that creates high-quality multiple-choice quizzes.

Generate exactly ${count} multiple-choice questions about "${topic}".

Requirements:
- Difficulty: ${difficulty}
- Each question must have exactly 4 unique answer options.
- Provide the correct answer index (0-3) and a short explanation.
- Return output ONLY as valid JSON in the following schema (no additional text):

{
  "questions": [
    {
      "id": "<unique-id>",
      "text": "<question text>",
      "options": ["<opt1>", "<opt2>", "<opt3>", "<opt4>"],
      "correctAnswer": <0|1|2|3>,
      "explanation": "<brief explanation>",
      "difficulty": "${difficulty}"
    }
  ]
}

Ensure the JSON is parseable by a strict JSON parser. Do not include any extra fields, comments, or wrapping text.`
}

const createMockQuestions = (
  payload: GenerateQuizRequest,
  prefix = 'mock'
): Question[] =>
  Array.from({ length: payload.count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    text: `Mock question ${i + 1} about ${payload.topic}?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4),
    explanation: `This is a mock explanation for question ${i + 1}.`,
    difficulty: payload.difficulty,
  }))

export const generateQuizQuestions = async (
  payload: GenerateQuizRequest
): Promise<GenerateQuizResponse> => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { questions: createMockQuestions(payload) }
  }

  const prompt = openAIPromptTemplate(payload)

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that only responds with valid JSON. Do not include any additional prose.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 1200,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `OpenAI API error (${response.status}): ${response.statusText} - ${text}`
    )
  }

  const data = (await response.json()) as any

  if (!data?.choices?.[0]?.message?.content) {
    throw new Error('OpenAI returned unexpected response structure')
  }

  const content: string = data.choices[0].message.content

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch (error) {
    throw new Error('Failed to parse JSON response from OpenAI: ' + String(error))
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as any).questions)
  ) {
    throw new Error('OpenAI response does not contain questions array')
  }

  const questions = (parsed as any).questions

  if (questions.length !== payload.count) {
    throw new Error(
      `Expected ${payload.count} questions, but got ${questions.length}`
    )
  }

  const validated: Question[] = questions.map((q: unknown) => {
    if (!validateQuestion(q)) {
      throw new Error('One or more questions failed validation')
    }
    return q
  })

  return { questions: validated }
}
