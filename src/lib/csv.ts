/**
 * Download an array of objects as a CSV file.
 * Adds a UTF-8 BOM so Excel opens accented characters correctly.
 */
export function downloadCSV(data: any[], filename: string): void {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
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
