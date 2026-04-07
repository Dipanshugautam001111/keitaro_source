import { BaseFilter } from "./base-filter";
import { RawClick } from "../pipeline/raw-click";

export abstract class StringMatchFilter extends BaseFilter {
    protected abstract getValue(click: RawClick): string;

    protected isMatch(click: RawClick): boolean {
        const value = this.getValue(click);
        const matchType = this.payload.match_type || 'exact'; // exact, contains, regex
        const targets = Array.isArray(this.payload.values) ? this.payload.values as string[] : [];

        for (const target of targets) {
            if (matchType === 'exact' && value === target) return true;
            if (matchType === 'contains' && value.includes(target)) return true;
            if (matchType === 'regex' && new RegExp(target, 'i').test(value)) return true;
        }

        return false;
    }
}
