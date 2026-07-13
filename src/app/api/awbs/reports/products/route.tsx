import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF } from "@/components/reports/ReportPDF";
import { t, fmtDate, skipKey, buildColumns, buildSubtitle, DATE_KEYS, AMOUNT_KEYS, fmtDateTime } from "@/lib/reports/reportUtils";

// sp_flower_packing_arrived_products_report params:
// @lddate datetime, @lcawbcode varchar, @lcgrower_uq varchar

export async function GET(req: NextRequest) {
    const sp         = req.nextUrl.searchParams;
    const lddate     = sp.get("date_invo") ?? "";
    const awbcode    = sp.get("awbcode")   ?? "";
    const grower_uq  = sp.get("grower_uq") ?? "%";
    if (!lddate || !awbcode)
        return new Response(JSON.stringify({ error: "date_invo and awbcode are required." }), { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_arrived_products_report", {
            lddate, lcawbcode: awbcode, lcgrower_uq: grower_uq,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];

    if (sp.get("format") === "csv") {
        const keys   = rows.length ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map(row => keys.map(k => {
            const v = row[k]; const ku = k.replace(/ /g, "_").toUpperCase();
            const s = DATE_KEYS.has(ku) ? fmtDate(v) : AMOUNT_KEYS.has(ku) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v);
            return `"${s.replace(/"/g, '""')}"`;
        }).join(",")).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", {
            headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="products_${awbcode}.csv"` },
        });
    }

    const columns = buildColumns(rows, false);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = buildSubtitle(
        `AWB: ${awbcode}`,
        `Date: ${fmtDate(lddate)}`,
        `${rows.length} record(s)`,
    );

    const buffer = await renderToBuffer(
        <ReportPDF company={company} title="Arrived Products" subtitle={subtitle} columns={columns} rows={rows} landscape />
    );
    return new Response(new Uint8Array(buffer), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="products_${awbcode}.pdf"` },
    });
}
