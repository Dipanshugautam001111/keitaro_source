import { RawClick } from "./raw-click";
import { Flow, Filter } from "@prisma/client";
import { FilterEvaluator } from "../filters/filter-evaluator";
import { UniquenessChecker } from "./uniqueness-checker";

type FlowWithFilters = Flow & { filters: Filter[] };

export class FlowSelector {

    /**
     * Selects the appropriate flow based on Keitaro's order:
     * 1. Forced flows (if matched, click MUST go here) - Assuming position < 0 or specific flag?
     *    (Keitaro usually orders by position, filters are checked in position order).
     * 2. Regular streams (checked sequentially).
     * 3. Default stream (if no other stream matches).
     */
    static async selectFlow(click: RawClick, flows: FlowWithFilters[]): Promise<FlowWithFilters | null> {
        // Sort flows by position ascending
        const sortedFlows = flows.sort((a, b) => a.position - b.position);

        // Keitaro evaluates streams sequentially. The first one where filters pass is chosen.
        for (const flow of sortedFlows) {
            console.log(`Checking flow... ${flow.id}`);

            // Re-evaluate flow uniqueness per flow right before filter evaluation
            // Awaiting this is required so click context is updated before filter evaluation.
            try {
                click.is_unique_flow = await UniquenessChecker.checkFlowUniqueness(click, flow.id);
            } catch {
                click.is_unique_flow = true;
            }

            const logic = flow.filter_logic === 'or' ? 'or' : 'and';
            const passed = FilterEvaluator.evaluate(click, flow.filters, logic);

            if (passed) {
                console.log(`Passed. Checking the schema and action.`);
                return flow;
            } else {
                console.log(`Blocks by filter. Not passed.`);
            }
        }

        return null; // No flow matched
    }

    /**
     * Weighted Random selection for Landing or Offer.
     */
    static selectWeightedItem<T extends { weight: number }>(items: T[]): T | null {
        if (items.length === 0) return null;
        if (items.length === 1) return items[0];

        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight === 0) return items[Math.floor(Math.random() * items.length)];

        let random = Math.random() * totalWeight;
        for (const item of items) {
            if (random < item.weight) {
                return item;
            }
            random -= item.weight;
        }

        return items[items.length - 1];
    }
}
