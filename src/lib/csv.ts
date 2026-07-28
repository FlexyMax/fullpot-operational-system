import * as XLSX from "xlsx";

/** De-duplicate keys produced by the API normalizer (which emits both original-case
 *  and UPPERCASE aliases).  Keep the UPPERCASE version; drop the lowercase twin. */
function dedupeHeaders(data: any[]): string[] {
    const all = Object.keys(data[0]);
    return all.filter(k => {
        const up = k.toUpperCase();
        // If an uppercase twin exists AND this key is not already uppercase, skip it
        return k === up || !all.includes(up);
    });
}

/** Return a numeric value if v is a pure number string, otherwise the string. */
function coerce(v: any): any {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "number") return v;
    if (typeof v === "string") {
        const stripped = v.replace(/[$,\s]/g, "");
        if (stripped !== "" && !isNaN(Number(stripped)) && !/[^0-9.\-]/.test(stripped)) {
            return Number(stripped);
        }
    }
    return v;
}

/**
 * Download an array of objects as a proper Excel (.xlsx) file using SheetJS.
 * Numeric strings are coerced to numbers so Excel treats them as amounts.
 */
export function downloadXLS(data: any[], filename: string): void {
    if (!data.length) return;
    const headers = dedupeHeaders(data);
    const ws = XLSX.utils.aoa_to_sheet([
        headers,
        ...data.map(r => headers.map(k => coerce(r[k]))),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Download an array of objects as a CSV file.
 * Adds a UTF-8 BOM so Excel opens accented characters correctly.
 */
export function downloadCSV(data: any[], filename: string): void {
    if (!data.length) return;
    const headers = dedupeHeaders(data);
    const rows = data.map(r =>
        headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
