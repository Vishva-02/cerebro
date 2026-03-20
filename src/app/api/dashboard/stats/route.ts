import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = (session.user as any).id;

        const [count, averages, maxScore, totalQuestions] = await Promise.all([
            prisma.quizAttempt.count({ where: { userId } }),
            prisma.quizAttempt.aggregate({
                where: { userId },
                _avg: { percentage: true },
            }),
            prisma.quizAttempt.aggregate({
                where: { userId },
                _max: { score: true },
            }),
            prisma.quizAttempt.aggregate({
                where: { userId },
                _sum: { totalQuestions: true },
            }),
        ]);

        return NextResponse.json({
            totalQuizzes: count,
            avgScore: Math.round(averages._avg.percentage || 0),
            highestScore: maxScore._max.score || 0,
            totalQuestions: totalQuestions._sum.totalQuestions || 0,
        });
    } catch (error: any) {
        console.error("DASHBOARD_STATS_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
