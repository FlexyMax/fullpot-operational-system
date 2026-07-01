import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

// Payments by Date Report — VFP: ws_outcomes_payments.frx
// SP: sp_flower_growers_payments_by_dates_report
// Params: lcgrower_uq, ldpayments_from, ldpayments_to

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => { const n = parseFloat(v ?? ""); return isNaN(n) ? t(v) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { timeZone: "America/New_York" }) : t(v); };

// Known column layout from VFP ws_outcomes_payments.frx and current ModalPaymentsReport
const COLUMNS: ReportColumn[] = [
    { key: "OUT_DATE",      label: "Date",         width: 1.0, render: r => fmtDate(r.OUT_DATE) },
    { key: "OUT_DOCUMENT",  label: "Document",     width: 1.0 },
    { key: "STATUS",        label: "Status",       width: 0.9 },
    { key: "BANK",          label: "Bank",         width: 1.4 },
    { key: "GROWER",        label: "Vendor",       width: 1.8 },
    { key: "FARM",          label: "Farm",         width: 1.4 },
    { key: "TOTAL_PAYMENT", label: "Total Payment",width: 1.2, align: "right", render: r => fmt(r.TOTAL_PAYMENT) },
];

export async function GET(req: NextRequest) {
    const sp            = req.nextUrl.searchParams;
    const grower_uq     = sp.get("grower_uq")     ?? "";
    const payments_from = sp.get("payments_from") ?? new Date("2000-01-01").toISOString();
    const payments_to   = sp.get("payments_to")   ?? new Date().toISOString();
    const grower_name   = sp.get("grower_name")   ?? "";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_payments_by_dates_report", {
            lcgrower_uq:     grower_uq,
            ldpayments_from: payments_from,
            ldpayments_to:   payments_to,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];

    // Detect if SP returns the known columns; fall back to dynamic if not
    const knownKeys = new Set(["OUT_DATE","OUT_DOCUMENT","STATUS","BANK","GROWER","FARM","TOTAL_PAYMENT"]);
    const hasKnown = rows.length > 0 && Object.keys(rows[0]).some(k => knownKeys.has(k));
    const columns: ReportColumn[] = hasKnown ? COLUMNS : Object.keys(rows[0] ?? {}).map(key => ({
        key, label: key.replace(/_/g, " "), width: 1,
        align: (["TOTAL_PAYMENT","AMMOUNT","AMOUNT","BALANCE"].includes(key) ? "right" : "left") as "left" | "right",
    }));

    const subtitle = [
        grower_name ? `Vendor: ${grower_name}` : grower_uq ? `Vendor: ${grower_uq}` : "All Vendors",
        `Period: ${fmtDate(payments_from)} – ${fmtDate(payments_to)}`,
        `${rows.length} payment(s)`,
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
            "Content-Disposition": `inline; filename="payments_${grower_uq || "all"}.pdf"`,
        },
    });
}
