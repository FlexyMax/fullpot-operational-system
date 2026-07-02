import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF } from "@/components/reports/ReportPDF";
import { t, fmt, fmtDate, fmtDateTime, skipKey, buildColumns, extractVendorInfo, buildSubtitle, DATE_KEYS, AMOUNT_KEYS } from "@/lib/reports/reportUtils";

// SP: sp_flower_growers_payments_report
// Params: lcoutcome_uq

export async function GET(req: NextRequest) {
    const sp         = req.nextUrl.searchParams;
    const outcome_uq = sp.get("outcome_uq") ?? "";
    if (!outcome_uq) return new Response("outcome_uq required", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_payments_report", { lcoutcome_uq: outcome_uq }),
        getCompanyInfo(),
    ]);

    const rows  = r.recordset ?? [];
    const first = rows[0];

    if (sp.get("format") === "csv") {
        const keys   = rows.length ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map(row => keys.map(k => { const v = row[k]; const ku = k.replace(/ /g,"_").toUpperCase(); const s = DATE_KEYS.has(ku) ? fmtDate(v) : AMOUNT_KEYS.has(ku) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v); return `"${s.replace(/"/g,'""')}"`; }).join(",")).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="payment_${outcome_uq}.csv"` } });
    }

    const columns = buildColumns(rows, true);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const vendorInfo = first ? extractVendorInfo(first) : undefined;

    const subtitle = first
        ? buildSubtitle(t(first.GROWER ?? first.FARM ?? ""), t(first.OUT_DOCUMENT ?? outcome_uq), fmtDate(first.OUT_DATE))
        : outcome_uq;

    const buffer = await renderToBuffer(
        <ReportPDF company={company} title="Payment Detail" subtitle={subtitle} vendorInfo={vendorInfo} columns={columns} rows={rows} landscape />
    );
    return new Response(new Uint8Array(buffer), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="payment_${outcome_uq}.pdf"` },
    });
}
