import { RawClick } from "../pipeline/raw-click";

export interface FilterPayload {
    [key: string]: unknown;
}

export abstract class BaseFilter {
    protected mode: 'accept' | 'reject';
    protected payload: FilterPayload;

    constructor(mode: 'accept' | 'reject', payload: FilterPayload) {
        this.mode = mode;
        this.payload = payload;
    }

    /**
     * Determine if the filter matches the click context.
     * This is the internal check logic.
     */
    protected abstract isMatch(click: RawClick): boolean;

    /**
     * Evaluate the filter applying the accept/reject mode.
     */
    public evaluate(click: RawClick): boolean {
        const match = this.isMatch(click);
        return this.mode === 'accept' ? match : !match;
    }
}
