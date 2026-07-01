import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

// 4 Months Summary Report — SP: sp_flower_growers_pending_accounts_last_quarter

const t           = (v: any) => String(v ?? "").trim();
const fmt         = (v: any) => { const n = parseFloat(v ?? ""); return isNaN(n) ? t(v) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtDate     = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { timeZone: "America/New_York" }) : t(v); };
const fmtDateTime = (v: any): string => { const d = v instanceof Date ? v : (v ? new Date(v) : null); if (!d || isNaN(d.getTime())) return String(v ?? "").trim(); const hasTime = d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0 || d.getUTCSeconds() !== 0; if (hasTime) { const dt = d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); const tm = d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit" }); return `${dt} ${tm}`; } return d.toLocaleDateString("en-US", { timeZone: "America/New_York" }); };

const AMOUNT_KEYS   = new Set(["B30","B60","B90","B91","TOTAL","BALANCE","AMMOUNT","AMOUNT"]);
const DATE_KEYS     = new Set(["LAST_DATE","LASTDATE","LDATE","DATE"]);
const VFP_SKIP      = new Set(["REPORTE","TITULO","PDF","FRX","NOMBRE_REPORTE","REPORT","TITLE","XLS","XLS_FILE","XLSFILE","SUBTITULO","TITULO_REPORTE","SUBTITU","NOMBRE_TITULO","SUB_TITULO"]);
const INTERNAL_SKIP = new Set(["UNICO","SUPPLIER_UQ","GROWER_UQ"]);

const skipKey = (key: string) => {
    const ku = key.replace(/ /g, "_").toUpperCase();
    return VFP_SKIP.has(ku) || VFP_SKIP.has(key.toUpperCase()) || INTERNAL_SKIP.has(ku);
};

function buildColumns(rows: any[]): ReportColumn[] {
    if (!rows.length) return [];
    return Object.keys(rows[0]).filter(key => !skipKey(key)).map(key => ({
        key,
        label: key.replace(/_/g, " "),
        width: AMOUNT_KEYS.has(key.toUpperCase()) ? 1.2 : DATE_KEYS.has(key.toUpperCase()) ? 1.0 : 1.6,
        align: (AMOUNT_KEYS.has(key.toUpperCase()) ? "right" : "left") as "left" | "right",
        render: (row: any) => { const v = row[key]; if (DATE_KEYS.has(key.toUpperCase())) return fmtDate(v); if (AMOUNT_KEYS.has(key.toUpperCase())) return fmt(v); if (v instanceof Date) return fmtDateTime(v); return t(v); },
    }));
}

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_pending_accounts_last_quarter", {}),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];

    if (sp.get("format") === "csv") {
        const keys   = rows.length > 0 ? Object.keys(rows[0]).filter(k => !skipKey(k)) : [];
        const header = keys.join(",");
        const body   = rows.map(row => keys.map(k => { const v = row[k]; const ku = k.toUpperCase(); const s = DATE_KEYS.has(ku) ? fmtDate(v) : AMOUNT_KEYS.has(ku) ? t(v) : v instanceof Date ? fmtDateTime(v) : t(v); return `"${s.replace(/"/g, '""')}"`; }).join(",")).join("\r\n");
        return new Response(header ? `${header}\r\n${body}` : "", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="quarterly_summary.csv"` } });
    }

    const columns = buildColumns(rows);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = `All Vendors  |  Last 4 Months  |  ${rows.length} record(s)`;

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title="4 Months Balance Summary"
            subtitle={subtitle}
            columns={columns}
            rows={rows}
            landscape={true}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="quarterly_summary.pdf"`,
        },
    });
}
