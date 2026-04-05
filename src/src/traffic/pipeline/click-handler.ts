import { NextRequest } from "next/server";
import { RawClickBuilder } from "./raw-click";
import { FlowSelector } from "./flow-selector";
import { MacroExpander } from "./macro-expander";

export class ClickHandler {
    async handle(req: NextRequest) {
        console.log("Starting pipeline...");

        // 1. Build Raw Click (parse IP, UA, referrer, sub params)
        const click = await RawClickBuilder.build(req);

        // 2. Resolve Campaign
        // TODO: Fetch Campaign from DB (Prisma) based on alias or ID
        click.campaign_id = 1; // Stub

        // 3. Geo & Device Parsing is now handled in RawClickBuilder

        // 4. Bot Detection
        // TODO: Check if bot (Redis/Local cache)

        // 5. Uniqueness Check
        // TODO: Check Redis for uniqueness

        console.log("Checking flow...");
        // 6. Check Flows and Filters
        // TODO: Fetch flows and filters from DB (Prisma) for this campaign
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flows: any[] = []; // Stub DB fetch

        const selectedFlow = FlowSelector.selectFlow(click, flows);

        if (!selectedFlow) {
            console.log("No flow matched. Falling back to default or 404.");
            return { clickId: click.id, action: 'none', targetUrl: '' };
        }

        click.flow_id = selectedFlow.id;

        console.log("Checking schema and action...");
        // 7. Execute Action & Schema
        let targetUrl = '';

        if (selectedFlow.schema_type === 'direct') {
            // direct link to offer
            targetUrl = "https://example-offer.com/?sub={click_id}"; // Stub Offer URL
        } else if (selectedFlow.schema_type === 'landing') {
            targetUrl = "https://example-landing.com/?click={click_id}"; // Stub Landing URL
        }

        // 8. Expand Macros
        targetUrl = MacroExpander.expand(targetUrl, click);

        // 9. Log Click
        // TODO: Push to Redis queue for background insertion into ClickHouse

        return {
            clickId: click.id,
            action: selectedFlow.action_type || 'redirect',
            targetUrl: targetUrl
        };
    }
}
