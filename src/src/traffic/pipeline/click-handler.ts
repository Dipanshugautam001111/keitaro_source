import { NextRequest } from "next/server";
import { RawClickBuilder } from "./raw-click";
import { FlowSelector } from "./flow-selector";
import { MacroExpander } from "./macro-expander";
import { prisma } from "@/lib/prisma";
import { BotDetector } from "./bot-detector";

export class ClickHandler {
    async handle(req: NextRequest) {
        console.log("Starting pipeline...");

        // Layer 1: Traffic Source Layer
        const tsLayer = ClickHandler.resolveTrafficSource(req);

        // 1. Build Raw Click (parse IP, UA, referrer, sub params)
        const click = await RawClickBuilder.build(req);

        if (tsLayer.spoofedReferrer) {
            click.referrer = tsLayer.spoofedReferrer;
        }

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
            console.log("Bot detected! Redirecting to Safe Page/404.");
            // Keitaro Layer 2: Decision Engine (Bot Traffic -> Safe Page / 404)
            return { clickId: click.id, action: '404', targetUrl: '' };
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

        let action = selectedFlow.action_type || 'redirect';
        if (tsLayer.hideReferrer && action === 'redirect') {
            action = 'blank_referrer';
        }

        return {
            clickId: click.id,
            action: action,
            targetUrl: targetUrl
        };
    }

    /**
     * Layer 1: Traffic Source Layer (Spoofing & Hiding Real Source)
     * This logic determines if the referrer should be modified before the click is processed further.
     */
    static resolveTrafficSource(req: NextRequest): { spoofedReferrer: string | null, hideReferrer: boolean } {
        const url = new URL(req.url);
        const sourceParam = url.searchParams.get('utm_source') || url.searchParams.get('source');

        // Logic to spoof referrers for trusted sources
        const trustedReferrers: Record<string, string> = {
            'google': 'https://www.google.com/',
            'x': 'https://t.co/',
            'linkedin': 'https://www.linkedin.com/',
            'vk': 'https://vk.com/',
            'blogger': 'https://www.blogger.com/'
        };

        if (sourceParam && trustedReferrers[sourceParam.toLowerCase()]) {
            return { spoofedReferrer: trustedReferrers[sourceParam.toLowerCase()], hideReferrer: false };
        }

        // Default: Hiding real source if requested via param
        const shouldHide = url.searchParams.get('hide_ref') === '1';
        return { spoofedReferrer: null, hideReferrer: shouldHide };
    }
}
