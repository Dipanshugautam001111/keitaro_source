import { RawClick } from "./raw-click";

export class MacroExpander {
    /**
     * Replaces Keitaro macros in the target URL.
     * Examples: {click_id}, {campaign_id}, {ip}, {country}, {sub_id}
     */
    static expand(url: string, click: RawClick): string {
        let expanded = url;

        // Core identifiers
        expanded = expanded.replace(/\{click_id\}/g, click.id);
        expanded = expanded.replace(/\{campaign_id\}/g, click.campaign_id.toString());
        expanded = expanded.replace(/\{flow_id\}/g, click.flow_id?.toString() || '');
        expanded = expanded.replace(/\{landing_id\}/g, click.landing_id?.toString() || '');
        expanded = expanded.replace(/\{offer_id\}/g, click.offer_id?.toString() || '');

        // Geo
        expanded = expanded.replace(/\{ip\}/g, click.ip);
        expanded = expanded.replace(/\{country\}/g, click.country);
        expanded = expanded.replace(/\{region\}/g, click.region);
        expanded = expanded.replace(/\{city\}/g, click.city);
        expanded = expanded.replace(/\{isp\}/g, click.isp);

        // Device
        expanded = expanded.replace(/\{device_type\}/g, click.device_type);
        expanded = expanded.replace(/\{os\}/g, click.os);
        expanded = expanded.replace(/\{browser\}/g, click.browser);
        expanded = expanded.replace(/\{user_agent\}/g, click.user_agent);

        // Traffic Source & Affiliate
        expanded = expanded.replace(/\{referrer\}/g, click.referrer);
        expanded = expanded.replace(/\{source\}/g, click.url_params['source'] || '');
        expanded = expanded.replace(/\{external_id\}/g, click.url_params['external_id'] || '');
        expanded = expanded.replace(/\{aff_sub2\}/g, click.id); // Often maps click_id to aff_sub2

        // Custom params
        // Performance optimization: Using a single regex to replace all sub params in one pass
        expanded = expanded.replace(/\{sub(\d+)\}/g, (match, num) => {
            const index = parseInt(num, 10);
            if (index >= 1 && index <= 15) {
                return click.url_params[`sub${num}`] || '';
            }
            return match;
        });

        return expanded;
    }
}
