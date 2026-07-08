import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF } from "@/components/reports/ReportPDF";
import { t, fmtDate, skipKey, buildColumns, DATE_KEYS, AMOUNT_KEYS, fmtDateTime } from "@/lib/reports/reportUtils";

// SP: sp_flower_salesmen_list_report — no params

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_salesmen_list_report", {}),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];

    if (sp.get("format") === "csv") {
        const keys   = rows.length ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map((row: any) =>
            keys.map(k => {
                const v  = row[k];
                const ku = k.replace(/ /g, "_").toUpperCase();
                const s  = DATE_KEYS.has(ku) ? fmtDate(v) : v instanceof Date ? fmtDateTime(v) : t(v);
                return `"${s.replace(/"/g, '""')}"`;
            }).join(",")
        ).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="salesreps_list.csv"`,
            },
        });
    }

    const columns = buildColumns(rows, false);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title="Sales Representatives List"
            subtitle={`${rows.length} record(s)`}
            columns={columns}
            rows={rows}
            landscape
        />
    );
    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="salesreps_list.pdf"`,
        },
    });
}
