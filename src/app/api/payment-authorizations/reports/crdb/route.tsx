import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

// GET ?crdb_uq=xxx&type=C|D
// type=C → sp_flower_accounts_pay_credits_report  (ws_growers_credits.frx)
// type=D → sp_flower_accounts_pay_debits_report   (ws_growers_debits.frx)

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => { const n = parseFloat(v ?? ""); return isNaN(n) ? t(v) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtDate     = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { timeZone: "America/New_York" }) : t(v); };
const fmtDateTime = (v: any): string => { const d = v instanceof Date ? v : (v ? new Date(v) : null); if (!d || isNaN(d.getTime())) return String(v ?? "").trim(); const hasTime = d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0 || d.getUTCSeconds() !== 0; if (hasTime) { const dt = d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); const tm = d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit" }); return `${dt} ${tm}`; } return d.toLocaleDateString("en-US", { timeZone: "America/New_York" }); };

const AMOUNT_KEYS = new Set(["CD_AMOUNT","CD_AMMOUNT","CD_TOTAL","CD_BALANCE","INVOICE_AMOUNT","INVOICE_BALANCE","AMMOUNT","AMOUNT"]);
const DATE_KEYS   = new Set(["CD_DATE","INVOICE_DATE","APDATE","DATE"]);
const VFP_SKIP    = new Set(["REPORTE","TITULO","PDF","FRX","NOMBRE_REPORTE","REPORT","TITLE","XLS","XLS_FILE","XLSFILE","SUBTITULO","TITULO_REPORTE","SUBTITU","NOMBRE_TITULO","SUB_TITULO"]);

const skipKey = (key: string) => VFP_SKIP.has(key) || VFP_SKIP.has(key.replace(/ /g, "_")) || VFP_SKIP.has(key.toUpperCase()) || VFP_SKIP.has(key.replace(/ /g, "_").toUpperCase());

function buildColumns(rows: any[]): ReportColumn[] {
    if (!rows.length) return [];
    return Object.keys(rows[0]).filter(k => !skipKey(k)).map(key => ({
        key,
        label: key.replace(/_/g, " "),
        width: AMOUNT_KEYS.has(key) ? 1.2 : DATE_KEYS.has(key) ? 1.0 : 1.4,
        align: (AMOUNT_KEYS.has(key) ? "right" : "left") as "left" | "right",
        render: (row: any) => { const v = row[key]; if (DATE_KEYS.has(key)) return fmtDate(v); if (AMOUNT_KEYS.has(key)) return fmt(v); if (v instanceof Date) return fmtDateTime(v); return t(v); },
    }));
}

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

    const rows = r.recordset ?? [];

    if (sp.get("format") === "csv") {
        const keys = rows.length > 0 ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body = rows.map(row => keys.map(k => { const v = row[k]; const s = DATE_KEYS.has(k) ? fmtDate(v) : AMOUNT_KEYS.has(k) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v); return `"${s.replace(/"/g, '""')}"`; }).join(",")).join("\r\n");
        const lbl = type === "D" ? "debit" : "credit";
        return new Response(header ? `${header}\r\n${body}` : "", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${lbl}_${crdb_uq}.csv"` } });
    }

    const columns = buildColumns(rows);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title=""
            columns={columns}
            rows={rows}
            landscape={true}
        />
    );

    const label = type === "D" ? "debit" : "credit";
    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${label}_${crdb_uq}.pdf"`,
        },
    });
}
