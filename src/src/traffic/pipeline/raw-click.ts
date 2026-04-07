import { NextRequest } from "next/server";

export interface RawClick {
    id: string;
    campaign_id: number;
    ip: string;
    user_agent: string;
    referrer: string;
    headers: Record<string, string>;
    url_params: Record<string, string>;

    // Geo
    country: string;
    region: string;
    city: string;
    isp: string;
    connection_type: string;

    // Device
    device_type: string;
    device_model: string;
    os: string;
    os_version: string;
    browser: string;
    browser_version: string;
    language: string;

    // Bot & Uniqueness
    is_bot: boolean;
    is_unique_campaign: boolean;
    is_unique_flow: boolean;

    // State during pipeline
    flow_id?: number;
    landing_id?: number;
    offer_id?: number;
}

export class RawClickBuilder {
    static async build(req: NextRequest): Promise<RawClick> {
        const url = new URL(req.url);
        const url_params = Object.fromEntries(url.searchParams.entries());

        const ip = (req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1').split(',')[0].trim();
        const user_agent = req.headers.get('user-agent') || '';

        const headers: Record<string, string> = {};
        req.headers.forEach((value, key) => {
            headers[key] = value;
        });

        // TODO: Replace stubs with actual GeoIP lookup (MaxMind)
        const geoInfo = {
            country: 'US',
            region: 'CA',
            city: 'San Francisco',
            isp: 'Comcast',
            connection_type: 'broadband'
        };

        // TODO: Replace stubs with actual User-Agent parser (UAParser.js)
        const deviceInfo = {
            device_type: user_agent.includes('Mobile') ? 'mobile' : 'desktop',
            device_model: 'Unknown',
            os: user_agent.includes('Windows') ? 'Windows' : (user_agent.includes('Mac OS') ? 'macOS' : 'Linux'),
            os_version: 'Unknown',
            browser: user_agent.includes('Chrome') ? 'Chrome' : 'Unknown',
            browser_version: 'Unknown',
        };

        // Basic initial click structure
        const click: RawClick = {
            id: crypto.randomUUID(),
            campaign_id: 0, // Should be resolved
            ip,
            user_agent,
            referrer: req.headers.get('referer') || '',
            headers,
            url_params,

            ...geoInfo,
            ...deviceInfo,

            language: req.headers.get('accept-language')?.split(',')[0] || 'en',

            is_bot: false,
            is_unique_campaign: true,
            is_unique_flow: true,
        };

        return click;
    }
}
