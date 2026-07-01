import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

// Single Payment Report — VFP: ws_outcomes_payments_resume.frx
// SP: sp_flower_growers_payments_report
// Params: lcoutcome_uq

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => { const n = parseFloat(v ?? ""); return isNaN(n) ? t(v) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US") : t(v); };

const AMOUNT_KEYS = new Set(["AMMOUNT","AMOUNT","BALANCE","OUT_AMMOUNT","TOTAL","TOTAL_PAYMENT","LINE_BALANCE"]);
const DATE_KEYS   = new Set(["APDATE","DATE_DUE","INV_DATE","INVOICE_DATE","OUT_DATE","DATE","DUE_DATE"]);

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
    const sp         = req.nextUrl.searchParams;
    const outcome_uq = sp.get("outcome_uq") ?? "";
    if (!outcome_uq) return new Response("outcome_uq required", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_payments_report", {
            lcoutcome_uq: outcome_uq,
        }),
        getCompanyInfo(),
    ]);

    const rows    = r.recordset ?? [];
    const first   = rows[0];
    const columns = buildColumns(rows);
    if (!columns.length) columns.push({ key: "_empty", label: "No data", width: 1 });

    const subtitle = first
        ? [t(first.GROWER ?? first.FARM ?? ""), t(first.OUT_DOCUMENT ?? outcome_uq), fmtDate(first.OUT_DATE)].filter(Boolean).join("   •   ")
        : outcome_uq;

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title="PAYMENT DETAIL"
            subtitle={subtitle}
            columns={columns}
            rows={rows}
            landscape={true}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="payment_${outcome_uq}.pdf"`,
        },
    });
}
