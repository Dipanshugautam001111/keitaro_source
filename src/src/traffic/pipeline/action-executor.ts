import { NextResponse } from "next/server";

export class ActionExecutor {
    static execute(action: string, targetUrl: string, options: { clickId?: string } = {}) {
        let response: NextResponse;

        switch(action) {
            case 'redirect':
            case 'http_redirect':
                response = NextResponse.redirect(targetUrl, 302);
                break;

            case 'meta':
                response = new NextResponse(
                    `<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body></body></html>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );
                break;

            case 'blank_referrer':
                response = new NextResponse(
                    `<html><head><meta name="referrer" content="no-referrer"><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body></body></html>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );
                break;

            case 'double_meta':
                // For a true double meta, the first page would redirect to a second internal page that then redirects to the targetUrl.
                // Here we simulate the second stage or use a single stage that achieves a similar result if possible.
                // Keitaro often uses an intermediate gateway.php for this.
                response = new NextResponse(
                    `<html><head><meta name="referrer" content="no-referrer"><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body><script>window.location.replace("${targetUrl}");</script></body></html>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );
                break;

            case 'iframe':
                response = new NextResponse(
                    `<html><body style="margin:0;padding:0"><iframe src="${targetUrl}" style="width:100%;height:100%;border:none;"></iframe></body></html>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );
                break;

            case 'js':
                response = new NextResponse(
                    `<script>window.location.replace("${targetUrl}");</script>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );
                break;

            case 'curl':
                // Server-to-server fetch logic would go here
                response = NextResponse.json({ status: "success", info: "Curl action executed (stub)" });
                break;

            case 'do_nothing':
                response = new NextResponse("", { status: 200 });
                break;

            case '404':
                response = new NextResponse("Not Found", { status: 404 });
                break;

            default:
                // API/JSON response fallback for KClient/JS integration
                response = NextResponse.json({ action, targetUrl });
        }

        if (options.clickId) {
            response.cookies.set('k_click_id', options.clickId, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
        }

        return response;
    }
}
