import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF } from "@/components/reports/ReportPDF";
import { t, fmtDate, fmtDateTime, skipKey, buildColumns, extractVendorInfo, buildSubtitle, DATE_KEYS, AMOUNT_KEYS } from "@/lib/reports/reportUtils";

// SP: sp_flower_growers_payments_by_dates_report
// Params: lcgrower_uq, ldpayments_from, ldpayments_to
// NOTE: SP returns column names with spaces (e.g. "OUT DATE"), not underscores.
// buildColumns handles this via normKey() — do NOT use hardcoded COLUMNS here.

export async function GET(req: NextRequest) {
    const sp            = req.nextUrl.searchParams;
    const grower_uq     = sp.get("grower_uq")     ?? "";
    const payments_from = sp.get("payments_from") ?? new Date("2000-01-01").toISOString();
    const payments_to   = sp.get("payments_to")   ?? new Date().toISOString();
    const grower_name   = sp.get("grower_name")   ?? "";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_payments_by_dates_report", {
            lcgrower_uq: grower_uq, ldpayments_from: payments_from, ldpayments_to: payments_to,
        }),
        getCompanyInfo(),
    ]);

    const rows     = r.recordset ?? [];
    const isSingle = !!grower_uq;

    if (sp.get("format") === "csv") {
        const keys   = rows.length ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map(row => keys.map(k => { const v = row[k]; const ku = k.replace(/ /g,"_").toUpperCase(); const s = DATE_KEYS.has(ku) ? fmtDate(v) : AMOUNT_KEYS.has(ku) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v); return `"${s.replace(/"/g,'""')}"`; }).join(",")).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="payments_${grower_uq||"all"}.csv"` } });
    }

    const columns    = buildColumns(rows, isSingle);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const vendorInfo = isSingle ? extractVendorInfo(rows[0], grower_name) : undefined;

    const subtitle = buildSubtitle(
        grower_name ? `Vendor: ${grower_name}` : grower_uq ? `Vendor: ${grower_uq}` : "All Vendors",
        `Period: ${fmtDate(payments_from)} to ${fmtDate(payments_to)}`,
        `${rows.length} payment(s)`,
    );

    const buffer = await renderToBuffer(
        <ReportPDF company={company} title="Payments by Date" subtitle={subtitle} vendorInfo={vendorInfo} columns={columns} rows={rows} landscape />
    );
    return new Response(new Uint8Array(buffer), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="payments_${grower_uq||"all"}.pdf"` },
    });
}
