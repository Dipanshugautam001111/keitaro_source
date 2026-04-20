import { NextRequest } from "next/server";
import { RawClickBuilder } from "./raw-click";
import { FlowSelector } from "./flow-selector";
import { MacroExpander } from "./macro-expander";
import { prisma } from "@/lib/prisma";
import { BotDetector } from "./bot-detector";
import { UniquenessChecker } from "./uniqueness-checker";
import { clickQueue } from "@/lib/queue";

export class ClickHandler {
    async handle(req: NextRequest) {
        console.log("Starting pipeline...");

        // 1. Build Raw Click (parse IP, UA, referrer, sub params)
        const click = await RawClickBuilder.build(req);

        // 2. Resolve Campaign
        // When using /api/click, Keitaro often receives campaign ID or alias as a query param or dedicated path.
        // To be safe, we check query params first, then path.
        const url = new URL(req.url);
        const idParam = url.searchParams.get('id');
        const aliasParam = url.searchParams.get('alias');

        let pathAlias = url.pathname.replace(/^\/|\/$/g, '');
        if (pathAlias === 'api/click') pathAlias = ''; // Ignore API root path

        const campaign = await prisma.campaign.findFirst({
            where: {
                OR: [
                    { alias: aliasParam || pathAlias || undefined },
                    { id: idParam ? Number(idParam) : undefined }
                ].filter(condition => Object.values(condition)[0] !== undefined && Object.values(condition)[0] !== ''),
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
        click.is_unique_campaign = await UniquenessChecker.checkCampaignUniqueness(click);

        console.log("Checking flow...");
        // 6. Check Flows and Filters
        const flows = campaign.flows;

        const selectedFlow = await FlowSelector.selectFlow(click, flows);

        if (!selectedFlow) {
            console.log("No flow matched. Falling back to default or 404.");
            return { clickId: click.id, action: 'none', targetUrl: '' };
        }

        click.flow_id = selectedFlow.id;

        console.log("Checking schema and action...");
        // 7. Execute Action & Schema
        let targetUrl = selectedFlow.action_payload || '';

        // If the flow directs to actual landings/offers stored in the DB, parse their IDs and fetch them.
        if (selectedFlow.schema_type === 'landing' && selectedFlow.landing_ids_json) {
            const landingIds = JSON.parse(selectedFlow.landing_ids_json);
            if (landingIds.length > 0) {
                // Here we should implement weighted selection, simplified to first for now:
                const landing = await prisma.landing.findUnique({ where: { id: landingIds[0] } });
                if (landing) {
                    targetUrl = landing.url;
                    click.landing_id = landing.id;
                }
            }
        } else if (selectedFlow.schema_type === 'direct' && selectedFlow.offer_ids_json) {
            const offerIds = JSON.parse(selectedFlow.offer_ids_json);
            if (offerIds.length > 0) {
                const offer = await prisma.offer.findUnique({ where: { id: offerIds[0] } });
                if (offer) {
                    targetUrl = offer.url;
                    click.offer_id = offer.id;
                }
            }
        }

        // 8. Expand Macros
        targetUrl = MacroExpander.expand(targetUrl, click);

        // 9. Log Click Asynchronously
        // We push the click data to BullMQ, which a separate worker will pick up
        // to batch insert into Prisma/ClickHouse, achieving the < 20ms p99 response time.
        try {
            await clickQueue.add('log-click', {
                click_data: {
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
            console.error("Failed to enqueue click logging job:", e);
            // Non-blocking, the user is still redirected.
        }

        return {
            clickId: click.id,
            action: selectedFlow.action_type || 'redirect',
            targetUrl: targetUrl
        };
    }
}
