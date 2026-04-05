import { NextRequest, NextResponse } from "next/server";
import { ClickHandler } from "@/traffic/pipeline/click-handler";

export async function GET(req: NextRequest) {
    try {
        const handler = new ClickHandler();
        const result = await handler.handle(req);

        // Output redirect or response based on the action
        if (result.action === 'redirect') {
            return NextResponse.redirect(result.targetUrl, 302);
        }

        return NextResponse.json({ status: "success", click_id: result.clickId });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
