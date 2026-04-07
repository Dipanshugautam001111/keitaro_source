import { NextRequest } from "next/server";
import { RawClickBuilder } from "./raw-click";
import { FlowSelector } from "./flow-selector";
import { MacroExpander } from "./macro-expander";
import { prisma } from "@/lib/prisma";
import { BotDetector } from "./bot-detector";

export class ClickHandler {
    async handle(req: NextRequest) {
        console.log("Starting pipeline...");

        // 1. Build Raw Click (parse IP, UA, referrer, sub params)
        const click = await RawClickBuilder.build(req);

        // 2. Resolve Campaign
        // Keitaro resolves by an alias in the URL (e.g. /my-campaign) or an explicit ID.
        // For the main tracker entry point, we typically look at the path alias.
        const url = new URL(req.url);
        const pathAlias = url.pathname.replace(/^\/|\/$/g, ''); // strip leading/trailing slashes

        const campaign = await prisma.campaign.findFirst({
            where: {
                OR: [
                    { alias: pathAlias },
                    // If the path is numeric, it might be a direct ID call
                    { id: isNaN(Number(pathAlias)) ? undefined : Number(pathAlias) }
                ],
                status: 'active'
            },
            include: {
                flows: {
                    include: {
                        filters: true
                    }
                }
            }
        });

        if (!campaign) {
            console.log("Campaign not found or inactive.");
            return { clickId: click.id, action: '404', targetUrl: '' };
        }

        click.campaign_id = campaign.id;

        // 3. Geo & Device Parsing is now handled in RawClickBuilder

        // 4. Bot Detection
        click.is_bot = BotDetector.check(click);
        if (click.is_bot) {
            console.log("Bot detected!");
            // Keitaro continues the pipeline, but filters can catch 'is_bot'
        }

        // 5. Uniqueness Check
        // TODO: Check Redis for uniqueness

        console.log("Checking flow...");
        // 6. Check Flows and Filters
        const flows = campaign.flows;

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
        // Write the click to the main database.
        // In full Keitaro, this is pushed to a Redis queue for async ClickHouse insertion.
        try {
            await prisma.click.create({
                data: {
                    id: click.id,
                    campaign_id: click.campaign_id,
                    flow_id: click.flow_id,
                    landing_id: click.landing_id,
                    offer_id: click.offer_id,
                    ip: click.ip,
                    user_agent: click.user_agent,
                    referrer: click.referrer,
                    country: click.country,
                    region: click.region,
                    city: click.city,
                    isp: click.isp,
                    device_type: click.device_type,
                    device_model: click.device_model,
                    os: click.os,
                    browser: click.browser,
                    is_bot: click.is_bot,
                    url_params_json: JSON.stringify(click.url_params),
                }
            });
        } catch (e) {
            console.error("Failed to log click to database:", e);
        }

        return {
            clickId: click.id,
            action: selectedFlow.action_type || 'redirect',
            targetUrl: targetUrl
        };
    }
}
