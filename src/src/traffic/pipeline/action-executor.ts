import { NextResponse } from "next/server";

export class ActionExecutor {
    static execute(action: string, targetUrl: string) {
        switch(action) {
            case 'redirect':
            case 'http_redirect':
                return NextResponse.redirect(targetUrl, 302);

            case 'meta':
                return new NextResponse(
                    `<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body></body></html>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );

            case 'iframe':
                return new NextResponse(
                    `<html><body style="margin:0;padding:0"><iframe src="${targetUrl}" style="width:100%;height:100%;border:none;"></iframe></body></html>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );

            case 'js':
                return new NextResponse(
                    `<script>window.location.replace("${targetUrl}");</script>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );

            case 'curl':
                // Server-to-server fetch logic would go here
                return NextResponse.json({ status: "success", info: "Curl action executed (stub)" });

            case 'do_nothing':
                return new NextResponse("", { status: 200 });

            case '404':
                return new NextResponse("Not Found", { status: 404 });

            default:
                // API/JSON response fallback for KClient/JS integration
                return NextResponse.json({ action, targetUrl });
        }
    }
}
