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

        const recentAttempts = await prisma.quizAttempt.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        return NextResponse.json(recentAttempts);
    } catch (error: any) {
        console.error("DASHBOARD_RECENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
