import { Queue } from 'bullmq';

// Note: BullMQ requires a Redis connection. We reuse the ioredis instance config.
// However, BullMQ strongly prefers a dedicated connection that it can block on.
const queueConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
};

const sharedConnection = { ...queueConnection, lazyConnect: true };

// In Next.js, importing Queues globally will attempt to connect during build/prerender.
// We must avoid initializing them strictly during static builds, or wrap them safely.
export const clickQueue = process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE
    ? new Queue('keitaro-clicks', { connection: sharedConnection })
    : new Queue('keitaro-clicks', {
        connection: sharedConnection,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: false,
        }
    });

clickQueue.on('error', (err) => console.warn('[Queue] Click queue error:', err.message));

export const conversionQueue = process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE
    ? new Queue('keitaro-conversions', { connection: sharedConnection })
    : new Queue('keitaro-conversions', {
        connection: sharedConnection,
        defaultJobOptions: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: false,
        }
    });

conversionQueue.on('error', (err) => console.warn('[Queue] Conversion queue error:', err.message));
