import type { Question } from '@/types'
import Groq from 'groq-sdk'

export type GenerateQuizRequest = {
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
}

export type GenerateQuizResponse = {
  questions: Question[]
}

// Recommended replacement for Groq LLaMA models
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

// ✅ MAIN FUNCTION
export const generateQuizQuestions = async (
  payload: GenerateQuizRequest
): Promise<GenerateQuizResponse> => {
  const apiKey = process.env.GROQ_API_KEY
  const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is missing on the server. Please check your Vercel Environment Variables or local .env.local file.')
  }

  const groq = new Groq({ apiKey })
  const prompt = openAIPromptTemplate(payload)

  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Return only valid JSON. No explanation. No markdown.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.6,
  })

  let content: string = response.choices?.[0]?.message?.content || ''

  // 🔥 CLEAN RESPONSE
  content = content.replace(/```json/g, '').replace(/```/g, '').trim()

  let parsed: any

  try {
    parsed = JSON.parse(content)
  } catch {
    // 🔥 FIX BAD JSON
    const fixed = content.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
    try {
      parsed = JSON.parse(fixed)
    } catch (parseError) {
      console.error("Failed to parse AI response:", content)
      throw new Error("AI returned invalid JSON format that could not be parsed.")
    }
  }

  if (!parsed?.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid structure from AI. Expected a JSON object with a "questions" array.')
  }

  const validated: Question[] = parsed.questions.map((q: unknown) => {
    if (!validateQuestion(q)) {
      console.error("Failed validation on question:", JSON.stringify(q))
      throw new Error('Validation failed for one or more questions returned by the AI.')
    }
    return q
  })

  return { questions: validated }
}