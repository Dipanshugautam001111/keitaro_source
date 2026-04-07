import { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";
// import { Reader } from "maxmind"; // Will be instantiated once globally in a real setup
// import path from "path";

export interface RawClick {
    id: string;
    campaign_id: number;
    ip: string;
    user_agent: string;
    referrer: string;
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

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';
        const user_agent = req.headers.get('user-agent') || '';

        // GeoIP (Stubbed logic for MaxMind because distributing the actual 60MB mmdb file is tricky here)
        // In full production: const geo = reader.get(ip);
        const geoInfo = {
            country: 'US', // geo?.country?.isoCode || ''
            region: 'CA', // geo?.subdivisions?.[0]?.isoCode || ''
            city: 'San Francisco', // geo?.city?.names?.en || ''
            isp: 'Comcast',
            connection_type: 'broadband'
        };

        // Parse User Agent
        const parser = new UAParser(user_agent);
        const browser = parser.getBrowser();
        const os = parser.getOS();
        const device = parser.getDevice();

        let deviceType = 'desktop';
        if (device.type === 'mobile') deviceType = 'mobile';
        else if (device.type === 'tablet') deviceType = 'tablet';
        else if (device.type === 'smarttv') deviceType = 'tv';

        const deviceInfo = {
            device_type: deviceType,
            device_model: device.model || 'Unknown',
            os: os.name || 'Unknown',
            os_version: os.version || 'Unknown',
            browser: browser.name || 'Unknown',
            browser_version: browser.version || 'Unknown',
        };

        // Basic initial click structure
        const click: RawClick = {
            id: crypto.randomUUID(),
            campaign_id: 0, // Should be resolved
            ip,
            user_agent,
            referrer: req.headers.get('referer') || '',
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
