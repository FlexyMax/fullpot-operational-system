import type { ReportColumn, VendorInfo } from "@/components/reports/ReportPDF";

// ─── Formatters ───────────────────────────────────────────────────────────────
export const t = (v: any) => String(v ?? "").trim();
export const fmt = (v: any) => { const n = parseFloat(v ?? ""); return isNaN(n) ? t(v) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
export const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { timeZone: "America/New_York" }) : t(v); };
export const fmtDateTime = (v: any): string => { const d = v instanceof Date ? v : (v ? new Date(v) : null); if (!d || isNaN(d.getTime())) return String(v ?? "").trim(); const hasTime = d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0 || d.getUTCSeconds() !== 0; if (hasTime) { const dt = d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); const tm = d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit" }); return `${dt} ${tm}`; } return d.toLocaleDateString("en-US", { timeZone: "America/New_York" }); };

// ─── Column classification ────────────────────────────────────────────────────
// Columns whose values are formatted as currency amounts
export const AMOUNT_KEYS = new Set([
    "AMMOUNT","AMOUNT","BALANCE","TOTAL","NET",
    "PAYMENTS","CREDITS","DEBITS","ACCUMULATED",
    "OUT_AMMOUNT","CRE_AMMOUNT","DEB_AMMOUNT","TOTAL_PAYMENT",
    "TOTAL_INV","TOTAL_PAY","TOTAL_BAL","INV_TOTAL","PAY_TOTAL",
    "CD_AMOUNT","CD_AMMOUNT","CD_TOTAL","CD_BALANCE",
    "INVOICE_AMOUNT","INVOICE_BALANCE",
    "B30","B60","B90","B91",
    // payment-detail SP columns (space-separated names normalized via normKey)
    "LINE_VALUE","LINE_BALANCE","LINE_CREDITS","LINE_DEBITS",
    "PAYMENT","OUT_BALANCE",
]);

// Columns whose values are formatted as dates
export const DATE_KEYS = new Set([
    "APDATE","DATE_DUE","INV_DATE","INVOICE_DATE","DATE","DUE_DATE",
    "LDATE","LASTDATE","LAST_DATE","DOC_DATE","PDATE","PAYMENT_DATE",
    "OUT_DATE","DATE_ORDER","CD_DATE",
]);

// VFP report metadata columns — never show in a web/PDF report
export const VFP_SKIP = new Set([
    "REPORTE","TITULO","PDF","FRX","NOMBRE_REPORTE","REPORT","TITLE",
    "XLS","XLS_FILE","XLSFILE","SUBTITULO","TITULO_REPORTE","SUBTITU",
    "NOMBRE_TITULO","SUB_TITULO",
]);

// Internal DB surrogate keys — useful for queries, meaningless in a report
export const INTERNAL_SKIP = new Set(["UNICO","SUPPLIER_UQ","GROWER_UQ"]);

// Vendor contact columns — go to the vendorInfo header, not the table
export const CONTACT_SKIP = new Set([
    "ADDRESS","CITY","PHONE","FAX","PHONE_FAX","EMAIL","MANAGER",
]);

// Vendor name columns — skip from table only when showing a single vendor
export const GROWER_COLS = new Set([
    "GROWER","SUPPLIER","GROWER_NAME","SUPPLIER_NAME",
]);

// ─── Key normalizer ───────────────────────────────────────────────────────────
export const normKey = (key: string) => key.replace(/ /g, "_").toUpperCase();

// Returns true when a column should ALWAYS be skipped from tables
export const skipKey = (key: string, extraSkip?: Set<string>): boolean => {
    const ku = normKey(key);
    return (
        VFP_SKIP.has(ku) || VFP_SKIP.has(key.toUpperCase()) ||
        INTERNAL_SKIP.has(ku) ||
        CONTACT_SKIP.has(ku) || CONTACT_SKIP.has(key) ||
        (extraSkip ? extraSkip.has(ku) || extraSkip.has(key) : false)
    );
};

// ─── Column builder ───────────────────────────────────────────────────────────
// Builds ReportColumn[] from raw SP rows.
// isSingleVendor: when true, also skip GROWER/SUPPLIER (shown in vendorInfo header).
// extraAmountKeys / extraDateKeys: route-specific additions to the shared sets.
export function buildColumns(
    rows: any[],
    isSingleVendor = false,
    extraSkip?: Set<string>,
): ReportColumn[] {
    if (!rows.length) return [];
    return Object.keys(rows[0]).filter(key => {
        if (skipKey(key, extraSkip)) return false;
        if (isSingleVendor) {
            const ku = normKey(key);
            if (GROWER_COLS.has(ku) || GROWER_COLS.has(key)) return false;
        }
        return true;
    }).map(key => {
        const ku = normKey(key);
        const isAmt  = AMOUNT_KEYS.has(ku) || AMOUNT_KEYS.has(key);
        const isDt   = DATE_KEYS.has(ku)   || DATE_KEYS.has(key);
        return {
            key,
            label: key.replace(/_/g, " "),
            width: isAmt ? 1.2 : isDt ? 1.0 : 1.4,
            align: (isAmt ? "right" : "left") as "left" | "right",
            render: (row: any) => {
                const v = row[key];
                if (isDt)  return fmtDate(v);
                if (isAmt) return fmt(v);
                if (v instanceof Date) return fmtDateTime(v);
                return t(v);
            },
        };
    });
}

// ─── Vendor info extractor ────────────────────────────────────────────────────
// Pulls vendor contact data from the first result row.
// Returns undefined when row is falsy (no data) or no name is available.
export function extractVendorInfo(row: any, fallbackName = ""): VendorInfo | undefined {
    if (!row) return undefined;
    const name = t(row.GROWER ?? row.SUPPLIER ?? row.GROWER_NAME ?? row.SUPPLIER_NAME ?? fallbackName);
    return {
        name,
        address: t(row.ADDRESS ?? ""),
        city:    t(row.CITY    ?? ""),
        phone:   t(row.PHONE   ?? row["PHONE FAX"] ?? row.PHONE_FAX ?? ""),
        email:   t(row.EMAIL   ?? ""),
        manager: t(row.MANAGER ?? ""),
    };
}

// ─── Subtitle builder ─────────────────────────────────────────────────────────
// Joins parts with " | " (ASCII-safe — Helvetica can't render en-dashes or bullets).
export const buildSubtitle = (...parts: (string | undefined | null | false)[]) =>
    parts.filter(Boolean).join("  |  ");
