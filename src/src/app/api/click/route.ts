import { NextRequest, NextResponse } from "next/server";
import { ClickHandler } from "@/traffic/pipeline/click-handler";
import { ActionExecutor } from "@/traffic/pipeline/action-executor";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const handler = new ClickHandler();
        const result = await handler.handle(req);

        return ActionExecutor.execute(result.action, result.targetUrl, { clickId: result.clickId });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
