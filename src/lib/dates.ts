import { toZonedTime, fromZonedTime, format as formatTz } from "date-fns-tz";
import { format, parseISO, isValid } from "date-fns";

const TZ = "America/New_York";

/** Current Date object in EST */
export function nowEST(): Date {
    return toZonedTime(new Date(), TZ);
}

/** Today's date as YYYY-MM-DD string in EST */
export function todayEST(): string {
    return format(toZonedTime(new Date(), TZ), "yyyy-MM-dd");
}

/** First day of current year in EST as YYYY-MM-DD */
export function startOfYearEST(): string {
    const now = toZonedTime(new Date(), TZ);
    return format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd");
}

/** Current year number in EST */
export function currentYearEST(): number {
    return toZonedTime(new Date(), TZ).getFullYear();
}

/** Format any date value to MM/DD/YYYY in EST — for display in UI */
export function formatDateEST(date: string | Date | null | undefined): string {
    if (!date) return "";
    try {
        const d = typeof date === "string" ? parseISO(date) : date;
        if (!isValid(d)) return "";
        return format(toZonedTime(d, TZ), "MM/dd/yyyy");
    } catch {
        return "";
    }
}

/** Format any date value to YYYY-MM-DD in EST — for API calls and inputs */
export function toISODateEST(date: string | Date | null | undefined): string {
    if (!date) return "";
    try {
        const d = typeof date === "string" ? parseISO(date) : date;
        if (!isValid(d)) return "";
        return format(toZonedTime(d, TZ), "yyyy-MM-dd");
    } catch {
        return "";
    }
}

/** Format to readable short date: Jan 15, 2026 in EST */
export function formatDateLongEST(date: string | Date | null | undefined): string {
    if (!date) return "";
    try {
        const d = typeof date === "string" ? parseISO(date) : date;
        if (!isValid(d)) return "";
        return format(toZonedTime(d, TZ), "MMM d, yyyy");
    } catch {
        return "";
    }
}

/** Format currency — always 2 decimals, right-aligned ready */
export function formatMoney(value: number | string | null | undefined): string {
    const n = typeof value === "string" ? parseFloat(value.replace(/[$,]/g, "")) : (value ?? 0);
    if (isNaN(n)) return "$0.00";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

/** Parse any money value to number */
export function parseMoney(value: number | string | null | undefined): number {
    if (!value) return 0;
    if (typeof value === "number") return value;
    return parseFloat(String(value).replace(/[$,]/g, "")) || 0;
}

/** Convert a local YYYY-MM-DD string to a UTC ISO string anchored at EST midnight */
export function dateInputToEST(dateStr: string): string {
    if (!dateStr) return "";
    const zoned = fromZonedTime(`${dateStr}T00:00:00`, TZ);
    return zoned.toISOString();
}
