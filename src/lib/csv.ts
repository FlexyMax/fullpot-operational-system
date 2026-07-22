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

/**
 * Download an array of objects as an Excel (.xls) file using HTML table encoding.
 */
export function downloadXLS(data: any[], filename: string): void {
    if (!data.length) return;
    const headers = dedupeHeaders(data);
    const html = [
        '<table border="1">',
        `<tr>${headers.map(h => `<th><b>${h}</b></th>`).join("")}</tr>`,
        ...data.map(r => `<tr>${headers.map(k => `<td>${r[k] ?? ""}</td>`).join("")}</tr>`),
        "</table>",
    ].join("");
    const blob = new Blob(["﻿" + html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: `${filename}.xls` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
