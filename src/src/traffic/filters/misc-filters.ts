import { StringMatchFilter } from "./string-match-filter";
import { RawClick } from "../pipeline/raw-click";

export class LanguageFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string { return click.language; }
}

export class ReferrerFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string { return click.referrer; }
}

export class UserAgentFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string { return click.user_agent; }
}
