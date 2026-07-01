import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF } from "@/components/reports/ReportPDF";
import { t, fmt, fmtDate, fmtDateTime, skipKey, buildColumns, buildSubtitle, DATE_KEYS, AMOUNT_KEYS } from "@/lib/reports/reportUtils";

// type=C → sp_flower_accounts_pay_credits_report
// type=D → sp_flower_accounts_pay_debits_report
// Params: lccrdb_uq

export async function GET(req: NextRequest) {
    const sp      = req.nextUrl.searchParams;
    const crdb_uq = sp.get("crdb_uq") ?? "";
    const type    = sp.get("type") ?? "C";
    if (!crdb_uq) return new Response("crdb_uq required", { status: 400 });

    const spName = type === "D"
        ? "sp_flower_accounts_pay_debits_report"
        : "sp_flower_accounts_pay_credits_report";

    const [r, company] = await Promise.all([
        executeProcedure(spName, { lccrdb_uq: crdb_uq }),
        getCompanyInfo(),
    ]);

    const rows  = r.recordset ?? [];
    const label = type === "D" ? "Debit" : "Credit";

    if (sp.get("format") === "csv") {
        const keys   = rows.length ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map(row => keys.map(k => { const v = row[k]; const ku = k.replace(/ /g,"_").toUpperCase(); const s = DATE_KEYS.has(ku) ? fmtDate(v) : AMOUNT_KEYS.has(ku) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v); return `"${s.replace(/"/g,'""')}"`; }).join(",")).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${label.toLowerCase()}_${crdb_uq}.csv"` } });
    }

    const columns = buildColumns(rows, false);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = buildSubtitle(crdb_uq, `${rows.length} record(s)`);

    const buffer = await renderToBuffer(
        <ReportPDF company={company} title={`${label} Detail`} subtitle={subtitle} columns={columns} rows={rows} landscape />
    );
    return new Response(new Uint8Array(buffer), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${label.toLowerCase()}_${crdb_uq}.pdf"` },
    });
}
