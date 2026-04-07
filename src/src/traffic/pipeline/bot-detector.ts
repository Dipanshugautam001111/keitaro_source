import { RawClick } from "./raw-click";

export class BotDetector {
    // Basic known bot user agents for the stub implementation
    private static knownBotSignatures = [
        'Googlebot', 'bingbot', 'YandexBot', 'AhrefsBot', 'Baiduspider', 'facebookexternalhit',
        'Twitterbot', 'rogerbot', 'linkedinbot', 'embedly', 'quora link preview',
        'showyoubot', 'outbrain', 'pinterest', 'slackbot', 'vkShare', 'W3C_Validator',
        'HeadlessChrome', 'Puppeteer', 'Lighthouse', 'GuzzleHttp', 'python-requests',
        'Go-http-client', 'Java/', 'okhttp', 'axios'
    ];

    /**
     * Checks if the current click context belongs to a known bot.
     * In a full Keitaro setup, this involves Redis caches, IP checking, and custom bot lists.
     */
    static check(click: RawClick): boolean {
        // 1. Check User Agent
        if (!click.user_agent) {
            // Missing UA is often a sign of a bot
            return true;
        }

        const lowerUA = click.user_agent.toLowerCase();
        for (const sig of this.knownBotSignatures) {
            if (lowerUA.includes(sig.toLowerCase())) {
                return true;
            }
        }

        // 2. Check for missing essential headers common in real browsers
        const essentialHeaders = ['accept', 'accept-language'];
        for (const header of essentialHeaders) {
            if (!click.headers[header]) {
                return true;
            }
        }

        // 3. Check for signatures of headless browsers/automation tools
        if (click.headers['x-puppeteer-version'] || click.headers['x-selenium-version']) {
            return true;
        }

        // 4. Check IP (Stub - would typically check against a Redis CIDR block list)
        // if (await isIpInBotList(click.ip)) return true;

        // 5. Check Velocity/Rate Limiting (Stub)
        // if (await isRateLimited(click.ip)) return true;

        return false;
    }
}
