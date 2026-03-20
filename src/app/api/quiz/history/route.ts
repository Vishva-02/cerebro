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

        const attempts = await prisma.quizAttempt.findMany({
            where: {
                userId: (session.user as any).id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(attempts);
    } catch (error: any) {
        console.error("GET_HISTORY_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
