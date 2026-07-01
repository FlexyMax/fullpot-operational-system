import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF } from "@/components/reports/ReportPDF";
import { t, fmt, fmtDate, fmtDateTime, skipKey, buildColumns, extractVendorInfo, buildSubtitle, DATE_KEYS, AMOUNT_KEYS } from "@/lib/reports/reportUtils";

// SP: sp_flower_growers_pending_invoices_report2
// Params: lcgrower_uq, ldfrom, ldto, lnoption

export async function GET(req: NextRequest) {
    const sp          = req.nextUrl.searchParams;
    const grower_uq   = sp.get("grower_uq")  ?? "";
    const ldfrom      = sp.get("ldfrom")     ?? new Date("2000-01-01").toISOString();
    const ldto        = sp.get("ldto")       ?? new Date().toISOString();
    const lnoption    = parseInt(sp.get("lnoption") ?? "1", 10);
    const grower_name = sp.get("grower_name") ?? "";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_pending_invoices_report2", { lcgrower_uq: grower_uq, ldfrom, ldto, lnoption }),
        getCompanyInfo(),
    ]);

    const rows           = r.recordset ?? [];
    const isSingleVendor = !!grower_uq;
    const vendorInfo     = isSingleVendor ? extractVendorInfo(rows[0], grower_name) : undefined;

    if (sp.get("format") === "csv") {
        const keys   = rows.length ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map(row => keys.map(k => { const v = row[k]; const ku = k.replace(/ /g,"_").toUpperCase(); const s = DATE_KEYS.has(ku) ? fmtDate(v) : AMOUNT_KEYS.has(ku) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v); return `"${s.replace(/"/g,'""')}"`; }).join(",")).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ap_summary_${grower_uq||"all"}.csv"` } });
    }

    const columns = buildColumns(rows, isSingleVendor);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = buildSubtitle(
        vendorInfo?.name ? `Vendor: ${vendorInfo.name}` : grower_uq ? `Vendor: ${grower_uq}` : "All Vendors",
        `Period: ${fmtDate(ldfrom)} to ${fmtDate(ldto)}`,
        `${rows.length} record(s)`,
    );

    const buffer = await renderToBuffer(
        <ReportPDF company={company} title="AP Summary" subtitle={subtitle} columns={columns} rows={rows} landscape vendorInfo={vendorInfo} />
    );
    return new Response(new Uint8Array(buffer), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="ap_summary_${grower_uq||"all"}.pdf"` },
    });
}
