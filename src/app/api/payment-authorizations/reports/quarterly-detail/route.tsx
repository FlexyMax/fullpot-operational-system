import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF } from "@/components/reports/ReportPDF";
import { t, fmt, fmtDate, fmtDateTime, skipKey, buildColumns, extractVendorInfo, buildSubtitle, DATE_KEYS, AMOUNT_KEYS } from "@/lib/reports/reportUtils";

// SP: sp_flower_growers_pending_accounts_last_quarter_detail
// Params: lcgrower_uq

export async function GET(req: NextRequest) {
    const sp          = req.nextUrl.searchParams;
    const grower_uq   = sp.get("grower_uq")   ?? "";
    const grower_name = sp.get("grower_name") ?? "";

    if (!grower_uq) return new Response(JSON.stringify({ error: "grower_uq required" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_pending_accounts_last_quarter_detail", { lcgrower_uq: grower_uq }),
        getCompanyInfo(),
    ]);

    const rows       = r.recordset ?? [];
    const vendorInfo = extractVendorInfo(rows[0], grower_name);

    if (sp.get("format") === "csv") {
        const keys   = rows.length ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map(row => keys.map(k => { const v = row[k]; const ku = k.replace(/ /g,"_").toUpperCase(); const s = DATE_KEYS.has(ku) ? fmtDate(v) : AMOUNT_KEYS.has(ku) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v); return `"${s.replace(/"/g,'""')}"`; }).join(",")).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="quarterly_detail_${grower_uq}.csv"` } });
    }

    const columns = buildColumns(rows, true);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = buildSubtitle(
        vendorInfo?.name ? `Vendor: ${vendorInfo.name}` : grower_uq,
        "Last 4 Months",
        `${rows.length} invoice(s)`,
    );

    const buffer = await renderToBuffer(
        <ReportPDF company={company} title="4 Months Balance Detail" subtitle={subtitle} columns={columns} rows={rows} landscape vendorInfo={vendorInfo} />
    );
    return new Response(new Uint8Array(buffer), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="quarterly_detail_${grower_uq}.pdf"` },
    });
}
