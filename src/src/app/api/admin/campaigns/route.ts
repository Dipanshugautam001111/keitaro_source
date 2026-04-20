import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth/jwt";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const campaigns = await prisma.campaign.findMany({
            include: { flows: true }
        });
        return NextResponse.json(campaigns);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Error fetching campaigns";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();

        const campaign = await prisma.campaign.create({
            data: {
                name: data.name,
                alias: data.alias,
                status: data.status || 'active',
                workspace_id: user.role === 'admin' ? null : user.userId,
            }
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Error creating campaign";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
