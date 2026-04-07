import { BaseFilter, FilterPayload } from "./base-filter";
import { RawClick } from "../pipeline/raw-click";

export class BotFilter extends BaseFilter {
    constructor(mode: 'accept' | 'reject', payload: FilterPayload) {
        super(mode, payload);
    }

    protected isMatch(click: RawClick): boolean {
        // If mode is 'accept' and it IS a bot, return true (matches filter condition)
        return click.is_bot;
    }
}
