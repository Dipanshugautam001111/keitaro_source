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

        // Custom params
        for (let i = 1; i <= 15; i++) {
            const subParam = `sub${i}`;
            const regex = new RegExp(`\\{${subParam}\\}`, 'g');
            expanded = expanded.replace(regex, click.url_params[subParam] || '');
        }

        return expanded;
    }
}
