import { RawClick } from "../pipeline/raw-click";
import { BaseFilter } from "./base-filter";
import { Filter } from "@prisma/client";
import { CountryFilter } from "./country-filter";
import { RegionFilter, CityFilter, IspFilter } from "./geo-filters";
import { DeviceTypeFilter, DeviceModelFilter, OsFilter, BrowserFilter } from "./device-filters";
import { SubIdFilter, CustomParamFilter } from "./param-filters";
import { BotFilter } from "./bot-filter";

export class FilterEvaluator {

    /**
     * Recreates the Filter instances from the DB models.
     */
    static buildFilter(dbFilter: Filter): BaseFilter | null {
        let payload: Record<string, unknown> = {};
        try {
            payload = JSON.parse(dbFilter.payload_json);
        } catch {
            console.error("Failed to parse filter payload", dbFilter.id);
            return null;
        }

        const mode = dbFilter.mode as 'accept' | 'reject';

        switch(dbFilter.type) {
            case 'country':
                return new CountryFilter(mode, payload);
            case 'region':
                return new RegionFilter(mode, payload);
            case 'city':
                return new CityFilter(mode, payload);
            case 'isp':
                return new IspFilter(mode, payload);
            case 'device_type':
                return new DeviceTypeFilter(mode, payload);
            case 'device_model':
                return new DeviceModelFilter(mode, payload);
            case 'os':
                return new OsFilter(mode, payload);
            case 'browser':
                return new BrowserFilter(mode, payload);
            case 'sub_id':
                return new SubIdFilter(mode, payload);
            case 'custom_param':
                return new CustomParamFilter(mode, payload);
            case 'bot':
                return new BotFilter(mode, payload);
            default:
                console.warn(`Unknown filter type: ${dbFilter.type}`);
                return null;
        }
    }

    /**
     * Evaluates a set of filters using AND or OR logic.
     * Keitaro logic:
     * If logic is AND, ALL filters must return true.
     * If logic is OR, AT LEAST ONE filter must return true.
     */
    static evaluate(click: RawClick, filters: Filter[], logic: 'and' | 'or' = 'and'): boolean {
        if (filters.length === 0) {
            return true; // No filters means it passes
        }

        if (logic === 'and') {
            for (const dbFilter of filters) {
                const filter = this.buildFilter(dbFilter);
                if (filter && !filter.evaluate(click)) {
                    return false;
                }
            }
            return true;
        } else { // 'or' logic
            for (const dbFilter of filters) {
                const filter = this.buildFilter(dbFilter);
                if (filter && filter.evaluate(click)) {
                    return true;
                }
            }
            return false;
        }
    }
}
