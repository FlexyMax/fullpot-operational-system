import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF } from "@/components/reports/ReportPDF";
import { t, fmt, fmtDate, fmtDateTime, skipKey, buildColumns, buildSubtitle, DATE_KEYS, AMOUNT_KEYS } from "@/lib/reports/reportUtils";

// SP: sp_flower_growers_payments_by_dates_resume_report
// Params: lcgrower_uq, ldpayments_from, ldpayments_to

export async function GET(req: NextRequest) {
    const sp            = req.nextUrl.searchParams;
    const grower_uq     = sp.get("grower_uq")     ?? "";
    const payments_from = sp.get("payments_from") ?? new Date("2000-01-01").toISOString();
    const payments_to   = sp.get("payments_to")   ?? new Date().toISOString();
    const grower_name   = sp.get("grower_name")   ?? "";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_payments_by_dates_resume_report", {
            lcgrower_uq: grower_uq, ldpayments_from: payments_from, ldpayments_to: payments_to,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];

    if (sp.get("format") === "csv") {
        const keys   = rows.length ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map(row => keys.map(k => { const v = row[k]; const ku = k.replace(/ /g,"_").toUpperCase(); const s = DATE_KEYS.has(ku) ? fmtDate(v) : AMOUNT_KEYS.has(ku) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v); return `"${s.replace(/"/g,'""')}"`; }).join(",")).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="payments_resume_${grower_uq||"all"}.csv"` } });
    }

    const columns = buildColumns(rows, false);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = buildSubtitle(
        grower_name ? `Vendor: ${grower_name}` : grower_uq ? `Vendor: ${grower_uq}` : "All Vendors",
        `Period: ${fmtDate(payments_from)} to ${fmtDate(payments_to)}`,
        `${rows.length} record(s)`,
    );

    const buffer = await renderToBuffer(
        <ReportPDF company={company} title="Payments Resume" subtitle={subtitle} columns={columns} rows={rows} landscape />
    );
    return new Response(new Uint8Array(buffer), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="payments_resume_${grower_uq||"all"}.pdf"` },
    });
}
