import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = await signToken({ userId: user.id, role: user.role });

        return NextResponse.json({ token });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
