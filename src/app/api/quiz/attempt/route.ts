import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { topic, difficulty, score, totalQuestions, percentage, timeSpent } = body;

        const attempt = await prisma.quizAttempt.create({
            data: {
                userId: (session.user as any).id,
                topic,
                difficulty,
                score,
                totalQuestions,
                percentage,
                timeSpent,
            },
        });

        return NextResponse.json(attempt);
    } catch (error: any) {
        console.error("SAVE_ATTEMPT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
