import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF } from "@/components/reports/ReportPDF";
import { t, fmtDate, skipKey, buildColumns, buildSubtitle, DATE_KEYS, AMOUNT_KEYS, fmtDateTime } from "@/lib/reports/reportUtils";

// sp_NC_packing_duties_products_credit_report params:
// @ldprint_date datetime, @lcprint_awb varchar(11), @lcprint_pk_uq char(8)

export async function GET(req: NextRequest) {
    const sp        = req.nextUrl.searchParams;
    const date_invo = sp.get("date_invo")  ?? "";
    const awbcode   = sp.get("awbcode")    ?? "";
    const grower_uq = sp.get("grower_uq")  ?? "";
    if (!awbcode)
        return new Response(JSON.stringify({ error: "awbcode is required." }), { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_NC_packing_duties_products_credit_report", {
            ldprint_date:  date_invo || new Date().toISOString().split("T")[0],
            lcprint_awb:   awbcode,
            lcprint_pk_uq: grower_uq,
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
            headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="duties_${awbcode}.csv"` },
        });
    }

    const columns = buildColumns(rows, false);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = buildSubtitle(
        `AWB: ${awbcode}`,
        `Date: ${fmtDate(date_invo || new Date().toISOString())}`,
        `${rows.length} record(s)`,
    );

    const buffer = await renderToBuffer(
        <ReportPDF company={company} title="Credits / Duties" subtitle={subtitle} columns={columns} rows={rows} landscape />
    );
    return new Response(new Uint8Array(buffer), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="duties_${awbcode}.pdf"` },
    });
}
