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

        const performanceData = await prisma.quizAttempt.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },
            select: {
                createdAt: true,
                percentage: true,
                topic: true,
            },
        });

        // Format data for Recharts
        const formattedData = performanceData.map((attempt: any) => ({
            date: new Date(attempt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: attempt.percentage,
            topic: attempt.topic,
        }));

        return NextResponse.json(formattedData);
    } catch (error: any) {
        console.error("DASHBOARD_PERFORMANCE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
