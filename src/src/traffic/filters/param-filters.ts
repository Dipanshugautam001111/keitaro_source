import { StringMatchFilter } from "./string-match-filter";
import { RawClick } from "../pipeline/raw-click";

export class SubIdFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string {
        const paramName = String(this.payload.param_name || 'sub_id');
        return click.url_params[paramName] || '';
    }
}

export class CustomParamFilter extends StringMatchFilter {
    protected getValue(click: RawClick): string {
        const paramName = this.payload.param_name;
        if (!paramName) return '';
        return click.url_params[String(paramName)] || '';
    }
}
