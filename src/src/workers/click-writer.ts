import { Worker } from 'bullmq';
import { prisma } from '../lib/prisma';

// This script is meant to be run as a standalone Node process (e.g., via Supervisor or pm2)
// Example: `npx tsx src/workers/click-writer.ts`

const queueConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
};

console.log("Starting Keitaro ClickWriter Worker...");

const worker = new Worker('keitaro-clicks', async job => {
    if (job.name === 'log-click') {
        const data = job.data.click_data;

        try {
            await prisma.click.create({
                data: {
                    id: data.id,
                    campaign_id: data.campaign_id,
                    flow_id: data.flow_id,
                    landing_id: data.landing_id,
                    offer_id: data.offer_id,
                    ip: data.ip,
                    user_agent: data.user_agent,
                    referrer: data.referrer,
                    country: data.country,
                    region: data.region,
                    city: data.city,
                    isp: data.isp,
                    device_type: data.device_type,
                    device_model: data.device_model,
                    os: data.os,
                    browser: data.browser,
                    is_bot: data.is_bot,
                    url_params_json: data.url_params_json,
                }
            });
            console.log(`[ClickWriter] Processed click ${data.id}`);
        } catch (error) {
            console.error(`[ClickWriter] Failed to insert click ${data.id}`, error);
            throw error; // Let BullMQ retry based on our exponential backoff strategy
        }
    }
}, { connection: queueConnection });

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

process.on('SIGINT', async () => {
    console.log("Shutting down ClickWriter...");
    await worker.close();
    process.exit(0);
});
