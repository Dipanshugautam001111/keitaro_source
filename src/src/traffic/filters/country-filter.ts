import { BaseFilter, FilterPayload } from "./base-filter";
import { RawClick } from "../pipeline/raw-click";

export class CountryFilter extends BaseFilter {
    constructor(mode: 'accept' | 'reject', payload: FilterPayload) {
        super(mode, payload);
    }

    protected isMatch(click: RawClick): boolean {
        const countries = Array.isArray(this.payload.countries) ? this.payload.countries as string[] : [];
        // Typically country codes are ISO alpha-2, e.g., 'US', 'GB'
        return countries.includes(click.country);
    }
}
