import { StringMatchFilter } from "./string-match-filter";
import { RawClick } from "../pipeline/raw-click";

export class DeviceTypeFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string { return click.device_type; }
}

export class DeviceModelFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string { return click.device_model; }
}

export class OsFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string { return click.os; }
}

export class BrowserFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string { return click.browser; }
}
