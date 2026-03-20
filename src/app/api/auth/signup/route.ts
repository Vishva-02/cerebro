import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, password } = body;

        if (!email || !password) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const exists = await prisma.user.findUnique({
            where: { email },
        });

        if (exists) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("SIGNUP_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
