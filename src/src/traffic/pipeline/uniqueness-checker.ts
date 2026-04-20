import { RawClick } from "./raw-click";
import { redis } from "@/lib/redis";

export class UniquenessChecker {
    /**
     * Checks if the click is unique for the campaign.
     * Sets the value in Redis to mark it for the next 24 hours.
     */
    static async checkCampaignUniqueness(click: RawClick): Promise<boolean> {
        // Uniqueness is typically determined by Campaign ID + IP
        const key = `uniq:camp:${click.campaign_id}:${click.ip}`;

        try {
            // SETNX returns 1 if key was set (meaning it was unique), 0 if it already existed
            const isUnique = await redis.setnx(key, '1');

            if (isUnique === 1) {
                // Set TTL to 24 hours
                await redis.expire(key, 86400);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Redis uniqueness check failed, failing open", error);
            // In case of Redis failure, default to unique to not block traffic
            return true;
        }
    }

    /**
     * Checks if the click is unique for the specific flow.
     */
    static async checkFlowUniqueness(click: RawClick, flowId: number): Promise<boolean> {
        const key = `uniq:flow:${flowId}:${click.ip}`;

        try {
            const isUnique = await redis.setnx(key, '1');
            if (isUnique === 1) {
                await redis.expire(key, 86400);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Redis flow uniqueness check failed", error);
            return true;
        }
    }
}
