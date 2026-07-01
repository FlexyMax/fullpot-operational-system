import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

// Payments Resume Report — VFP: ws_outcomes_payments_resume.frx
// SP: sp_flower_growers_payments_by_dates_resume_report
// Params: lcgrower_uq, ldpayments_from, ldpayments_to

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => { const n = parseFloat(v ?? ""); return isNaN(n) ? t(v) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US") : t(v); };

const AMOUNT_KEYS = new Set(["AMMOUNT","AMOUNT","BALANCE","OUT_AMMOUNT","TOTAL","TOTAL_PAYMENT","TOTAL_PAY","TOTAL_INV","NET"]);
const DATE_KEYS   = new Set(["APDATE","DATE_DUE","INV_DATE","INVOICE_DATE","OUT_DATE","DATE","DUE_DATE","LASTDATE"]);

function buildColumns(rows: any[]): ReportColumn[] {
    if (!rows.length) return [];
    return Object.keys(rows[0]).map(key => ({
        key,
        label: key.replace(/_/g, " "),
        width: AMOUNT_KEYS.has(key) ? 1.2 : DATE_KEYS.has(key) ? 1.0 : 1.6,
        align: (AMOUNT_KEYS.has(key) ? "right" : "left") as "left" | "right",
        render: (row: any) => DATE_KEYS.has(key) ? fmtDate(row[key]) : AMOUNT_KEYS.has(key) ? fmt(row[key]) : t(row[key]),
    }));
}

export async function GET(req: NextRequest) {
    const sp            = req.nextUrl.searchParams;
    const grower_uq     = sp.get("grower_uq")     ?? "";
    const payments_from = sp.get("payments_from") ?? new Date("2000-01-01").toISOString();
    const payments_to   = sp.get("payments_to")   ?? new Date().toISOString();
    const grower_name   = sp.get("grower_name")   ?? "";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_payments_by_dates_resume_report", {
            lcgrower_uq:     grower_uq,
            ldpayments_from: payments_from,
            ldpayments_to:   payments_to,
        }),
        getCompanyInfo(),
    ]);

    const rows    = r.recordset ?? [];
    const columns = buildColumns(rows);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = [
        grower_name ? `Vendor: ${grower_name}` : grower_uq ? `Vendor: ${grower_uq}` : "All Vendors",
        `Period: ${fmtDate(payments_from)} – ${fmtDate(payments_to)}`,
        `${rows.length} record(s)`,
    ].join("   •   ");

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title="PAYMENTS RESUME"
            subtitle={subtitle}
            columns={columns}
            rows={rows}
            landscape={true}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="payments_resume_${grower_uq || "all"}.pdf"`,
        },
    });
}
