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

        const userId = (session.user as any).id;
        const body = await request.json();
        const { topic, difficulty, currentQuestionIndex, answers, timeLeft, status } = body;

        // Try to find an existing in-progress session for this topic/difficulty
        const existingSession = await prisma.quizSession.findFirst({
            where: {
                userId,
                topic,
                status: "in-progress",
            },
        });

        if (existingSession) {
            const updated = await prisma.quizSession.update({
                where: { id: existingSession.id },
                data: {
                    currentQuestionIndex,
                    answers,
                    timeLeft,
                    status,
                },
            });
            return NextResponse.json(updated);
        } else {
            const newSession = await prisma.quizSession.create({
                data: {
                    userId,
                    topic,
                    difficulty,
                    currentQuestionIndex,
                    answers,
                    timeLeft,
                    status,
                },
            });
            return NextResponse.json(newSession);
        }
    } catch (error: any) {
        console.error("SESSION_SAVE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const topic = searchParams.get("topic");

        const quizSession = await prisma.quizSession.findFirst({
            where: {
                userId: (session.user as any).id,
                topic: topic || undefined,
                status: "in-progress",
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return NextResponse.json(quizSession);
    } catch (error: any) {
        console.error("SESSION_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
