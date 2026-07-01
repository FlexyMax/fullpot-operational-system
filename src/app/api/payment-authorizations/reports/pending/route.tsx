import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF } from "@/components/reports/ReportPDF";
import { t, fmt, fmtDate, fmtDateTime, skipKey, buildColumns, extractVendorInfo, buildSubtitle, DATE_KEYS, AMOUNT_KEYS } from "@/lib/reports/reportUtils";

// SP: sp_flower_growers_pending_invoices_report
// Params: lcgrower_uq, lddate_from, lddate_to

export async function GET(req: NextRequest) {
    const sp          = req.nextUrl.searchParams;
    const grower_uq   = sp.get("grower_uq")   ?? "";
    const date_from   = sp.get("date_from")   ?? new Date("2000-01-01").toISOString();
    const date_to     = sp.get("date_to")     ?? new Date().toISOString();
    const grower_name = sp.get("grower_name") ?? "";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_pending_invoices_report", {
            lcgrower_uq: grower_uq, lddate_from: date_from, lddate_to: date_to,
        }),
        getCompanyInfo(),
    ]);

    const rows           = r.recordset ?? [];
    const isSingleVendor = !!grower_uq;
    const vendorInfo     = isSingleVendor ? extractVendorInfo(rows[0], grower_name) : undefined;

    if (sp.get("format") === "columns") {
        return new Response(JSON.stringify(rows.length ? Object.keys(rows[0]) : [], null, 2), { headers: { "Content-Type": "application/json" } });
    }

    if (sp.get("format") === "csv") {
        const keys   = rows.length ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map(row => keys.map(k => { const v = row[k]; const ku = k.replace(/ /g,"_").toUpperCase(); const s = DATE_KEYS.has(ku) ? fmtDate(v) : AMOUNT_KEYS.has(ku) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v); return `"${s.replace(/"/g,'""')}"`; }).join(",")).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="pending_invoices_${grower_uq||"all"}.csv"` } });
    }

    const columns = buildColumns(rows, isSingleVendor);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = buildSubtitle(
        vendorInfo?.name ? `Vendor: ${vendorInfo.name}` : grower_uq ? `Vendor: ${grower_uq}` : "All Vendors",
        `Period: ${fmtDate(date_from)} to ${fmtDate(date_to)}`,
        `${rows.length} record(s)`,
    );

    const buffer = await renderToBuffer(
        <ReportPDF company={company} title="Pending Invoices" subtitle={subtitle} columns={columns} rows={rows} landscape vendorInfo={vendorInfo} />
    );
    return new Response(new Uint8Array(buffer), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="pending_invoices_${grower_uq||"all"}.pdf"` },
    });
}
