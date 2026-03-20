import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id

        // Fetch all attempts for this user
        const attempts = await prisma.quizAttempt.findMany({
            where: { userId },
            select: {
                topic: true,
                score: true,
                totalQuestions: true, // This field name should match schema.prisma
            },
        })

        // Aggregate by topic
        const topicData: Record<string, { topic: string; correct: number; incorrect: number }> = {}

        attempts.forEach((attempt) => {
            if (!topicData[attempt.topic]) {
                topicData[attempt.topic] = {
                    topic: attempt.topic,
                    correct: 0,
                    incorrect: 0,
                }
            }

            const correct = attempt.score
            const total = attempt.totalQuestions || 0
            const incorrect = Math.max(0, total - correct)

            topicData[attempt.topic].correct += correct
            topicData[attempt.topic].incorrect += incorrect
        })

        const items = Object.values(topicData)

        return NextResponse.json({ items })
    } catch (error) {
        console.error('Failed to fetch insights:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
