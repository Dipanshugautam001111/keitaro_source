import { StringMatchFilter } from "./string-match-filter";
import { RawClick } from "../pipeline/raw-click";

export class RegionFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string { return click.region; }
}

export class CityFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string { return click.city; }
}

export class IspFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string { return click.isp; }
}
