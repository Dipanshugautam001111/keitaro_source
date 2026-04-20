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
        // In full Keitaro, this queries ClickHouse.
        // Here, we perform a basic aggregation on the Prisma/MySQL backend.

        // Count total clicks
        const totalClicks = await prisma.click.count();

        // Count total conversions
        const totalConversions = await prisma.conversion.count();

        // Sum revenue
        const revenueResult = await prisma.conversion.aggregate({
            _sum: {
                revenue: true
            }
        });

        const totalRevenue = revenueResult._sum.revenue || 0;

        // Group clicks by campaign
        const clicksByCampaign = await prisma.click.groupBy({
            by: ['campaign_id'],
            _count: {
                id: true
            }
        });

        return NextResponse.json({
            totals: {
                clicks: totalClicks,
                conversions: totalConversions,
                revenue: totalRevenue,
            },
            by_campaign: clicksByCampaign
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Error fetching stats";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
