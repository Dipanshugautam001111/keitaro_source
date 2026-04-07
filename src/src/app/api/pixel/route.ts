import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// 1x1 transparent GIF base64 string
const TRANSPARENT_GIF = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const clickId = url.searchParams.get("click_id");

        if (clickId) {
            // Find the original click
            const click = await prisma.click.findUnique({
                where: { id: clickId }
            });

            if (click) {
                // Check if conversion already exists for this click
                const existing = await prisma.conversion.findUnique({
                    where: { click_id: clickId }
                });

                if (!existing) {
                    await prisma.conversion.create({
                        data: {
                            click_id: clickId,
                            campaign_id: click.campaign_id,
                            offer_id: click.offer_id,
                            revenue: 0, // Pixels typically don't pass revenue natively
                            status: "lead"
                        }
                    });
                }
            }
        }

        // Return a 1x1 pixel image regardless of success to avoid breaking the client's page
        return new NextResponse(TRANSPARENT_GIF, {
            headers: {
                'Content-Type': 'image/gif',
                'Cache-Control': 'no-store, no-cache, must-revalidate, private',
                'Pragma': 'no-cache'
            }
        });
    } catch (error) {
        // Even on error, return the pixel
        console.error("Pixel error:", error);
        return new NextResponse(TRANSPARENT_GIF, {
            headers: { 'Content-Type': 'image/gif' }
        });
    }
}
