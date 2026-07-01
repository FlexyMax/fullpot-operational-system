import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

// AP Summary Report — VFP: ws_growers_pending_accounts_last_quarter.frx
// SP: sp_flower_growers_pending_invoices_report2
// Params: lcgrower_uq, ldfrom, ldto, lnoption

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => { const n = parseFloat(v ?? ""); return isNaN(n) ? t(v) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { timeZone: "America/New_York" }) : t(v); };

const AMOUNT_KEYS = new Set(["AMMOUNT","AMOUNT","BALANCE","OUT_AMMOUNT","CRE_AMMOUNT","DEB_AMMOUNT","TOTAL","TOTAL_PAYMENT","NET","TOTAL_INV","TOTAL_PAY","TOTAL_BAL","INV_TOTAL","PAY_TOTAL"]);
const DATE_KEYS   = new Set(["APDATE","DATE_DUE","INV_DATE","INVOICE_DATE","DATE","DUE_DATE","LDATE","LASTDATE","DOC_DATE","PDATE","PAYMENT_DATE","OUT_DATE"]);
const VFP_SKIP    = new Set(["REPORTE","TITULO","PDF","FRX","NOMBRE_REPORTE","REPORT","TITLE"]);

function buildColumns(rows: any[]): ReportColumn[] {
    if (!rows.length) return [];
    return Object.keys(rows[0]).filter(key => !VFP_SKIP.has(key)).map(key => ({
        key,
        label: key.replace(/_/g, " "),
        width: AMOUNT_KEYS.has(key) ? 1.2 : DATE_KEYS.has(key) ? 1.0 : 1.6,
        align: (AMOUNT_KEYS.has(key) ? "right" : "left") as "left" | "right",
        render: (row: any) => DATE_KEYS.has(key) ? fmtDate(row[key]) : AMOUNT_KEYS.has(key) ? fmt(row[key]) : t(row[key]),
    }));
}

export async function GET(req: NextRequest) {
    const sp         = req.nextUrl.searchParams;
    const grower_uq  = sp.get("grower_uq")  ?? "";
    const ldfrom     = sp.get("ldfrom")     ?? new Date("2000-01-01").toISOString();
    const ldto       = sp.get("ldto")       ?? new Date().toISOString();
    const lnoption   = parseInt(sp.get("lnoption") ?? "1", 10);
    const grower_name = sp.get("grower_name") ?? "";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_pending_invoices_report2", {
            lcgrower_uq: grower_uq,
            ldfrom,
            ldto,
            lnoption,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const columns = buildColumns(rows);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = [
        grower_name ? `Vendor: ${grower_name}` : grower_uq ? `Vendor: ${grower_uq}` : "All Vendors",
        `Period: ${fmtDate(ldfrom)} – ${fmtDate(ldto)}`,
        `${rows.length} record(s)`,
    ].join("   •   ");

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title=""
            columns={columns}
            rows={rows}
            landscape={true}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="ap_summary_${grower_uq || "all"}.pdf"`,
        },
    });
}
