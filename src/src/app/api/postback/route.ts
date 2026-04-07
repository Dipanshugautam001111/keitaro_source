import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const clickId = url.searchParams.get("click_id");
        const payout = url.searchParams.get("payout") || "0";
        const txid = url.searchParams.get("txid");
        const status = url.searchParams.get("status") || "lead";

        if (!clickId) {
            return NextResponse.json({ error: "click_id is required" }, { status: 400 });
        }

        // Find the original click to associate campaign and offer
        const click = await prisma.click.findUnique({
            where: { id: clickId }
        });

        if (!click) {
            return NextResponse.json({ error: "click not found" }, { status: 404 });
        }

        // Deduplication based on transaction ID
        if (txid) {
            const existing = await prisma.conversion.findUnique({
                where: { transaction_id: txid }
            });
            if (existing) {
                return NextResponse.json({ status: "duplicate", message: "Conversion already recorded" });
            }
        }

        const conversion = await prisma.conversion.create({
            data: {
                click_id: clickId,
                campaign_id: click.campaign_id,
                offer_id: click.offer_id,
                revenue: parseFloat(payout),
                status: status,
                transaction_id: txid || null
            }
        });

        return NextResponse.json({ status: "success", conversion_id: conversion.id });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return GET(req); // Postbacks can often arrive as POST requests but we process them similarly based on query params for now.
}
