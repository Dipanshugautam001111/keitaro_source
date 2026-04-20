import { BaseFilter, FilterPayload } from "./base-filter";
import { RawClick } from "../pipeline/raw-click";

export class UniquenessFilter extends BaseFilter {
    constructor(mode: 'accept' | 'reject', payload: FilterPayload) {
        super(mode, payload);
    }

    protected isMatch(click: RawClick): boolean {
        const scope = this.payload.scope || 'campaign'; // 'campaign' or 'flow'

        if (scope === 'campaign') {
            return click.is_unique_campaign;
        } else if (scope === 'flow') {
            // Note: Flow uniqueness checking happens dynamically as streams are evaluated
            return click.is_unique_flow;
        }

        return false;
    }
}
