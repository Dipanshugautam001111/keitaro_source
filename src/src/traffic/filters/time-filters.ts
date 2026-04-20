import { BaseFilter, FilterPayload } from "./base-filter";

export class DayOfWeekFilter extends BaseFilter {
    constructor(mode: 'accept' | 'reject', payload: FilterPayload) {
        super(mode, payload);
    }

    protected isMatch(): boolean {
        // payload.days is expected to be an array of integers 0-6 (Sun-Sat) or 1-7 (Mon-Sun depending on Keitaro's specific spec, usually 1-7)
        const allowedDays = Array.isArray(this.payload.days) ? this.payload.days as number[] : [];
        if (allowedDays.length === 0) return true;

        // Uses UTC day by default unless campaign timezone is specified.
        // Keitaro uses 1 for Monday, 7 for Sunday. JS getDay() is 0 for Sunday, 1 for Monday.
        let currentDay = new Date().getUTCDay();
        currentDay = currentDay === 0 ? 7 : currentDay;

        return allowedDays.includes(currentDay);
    }
}

export class TimeOfDayFilter extends BaseFilter {
    constructor(mode: 'accept' | 'reject', payload: FilterPayload) {
        super(mode, payload);
    }

    protected isMatch(): boolean {
        // payload.hours is expected to be an array of integers 0-23
        const allowedHours = Array.isArray(this.payload.hours) ? this.payload.hours as number[] : [];
        if (allowedHours.length === 0) return true;

        const currentHour = new Date().getUTCHours();

        return allowedHours.includes(currentHour);
    }
}
