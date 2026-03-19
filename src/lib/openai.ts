import type { Question } from '@/types'

export type GenerateQuizRequest = {
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
}

export type GenerateQuizResponse = {
  questions: Question[]
}

// Groq provides an OpenAI-compatible chat completions endpoint.
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
// NOTE: `llama3-70b-8192` has been decommissioned on Groq.
// Recommended replacement (see Groq deprecations): `llama-3.3-70b-versatile`.
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile'

// ✅ Validate question
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

// ✅ Prompt
const openAIPromptTemplate = ({
  topic,
  difficulty,
  count,
}: GenerateQuizRequest): string => `
Generate exactly ${count} multiple-choice questions about "${topic}".

Rules:
- Difficulty: ${difficulty}
- 4 options
- correctAnswer index (0–3)
- include explanation

Return ONLY JSON:
{
  "questions": [
    {
      "id": "q1",
      "text": "question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "why",
      "difficulty": "${difficulty}"
    }
  ]
}
`

// ✅ Fallback
const createMockQuestions = (
  payload: GenerateQuizRequest,
  prefix = 'mock'
): Question[] =>
  Array.from({ length: payload.count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    text: `Mock question ${i + 1} about ${payload.topic}?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4),
    explanation: `Mock explanation ${i + 1}`,
    difficulty: payload.difficulty,
  }))

// ✅ MAIN FUNCTION
export const generateQuizQuestions = async (
  payload: GenerateQuizRequest
): Promise<GenerateQuizResponse> => {
  try {
    const apiKey = process.env.GROQ_API_KEY
    const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL

    // 🔥 If no API → fallback
    if (!apiKey) {
      console.warn('No Groq API key → using fallback')
      return { questions: createMockQuestions(payload) }
    }

    const prompt = openAIPromptTemplate(payload)

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'Return only valid JSON. No explanation. No markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
      }),
    })

    if (!response.ok) {
      // Read error body so we can see why Groq rejected the request (auth/model issues).
      const errorText = await response.text().catch(() => '')
      throw new Error(
        `Groq API error (${response.status} ${response.statusText}): ${errorText}`
      )
    }

    const data = await response.json()

    let content: string = data.choices?.[0]?.message?.content || ''

    // 🔥 CLEAN RESPONSE (VERY IMPORTANT)
    content = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let parsed: any

    try {
      parsed = JSON.parse(content)
    } catch {
      // 🔥 FIX BAD JSON
      const fixed = content
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')

      parsed = JSON.parse(fixed)
    }

    if (!parsed?.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid structure from AI')
    }

    const validated: Question[] = parsed.questions.map((q: unknown) => {
      if (!validateQuestion(q)) {
        throw new Error('Validation failed')
      }
      return q
    })

    return { questions: validated }
  } catch (error) {
    console.error('ERROR → using fallback:', error)

    return {
      questions: createMockQuestions(payload, 'fallback'),
    }
  }
}