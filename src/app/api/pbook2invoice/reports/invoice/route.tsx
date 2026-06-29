import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn, type ReportGroup } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0, 10); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmt2 = (v: any) => { const n = parseFloat(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US") : ""; };

// "Invoice" (main bar + Invoiced Prebooks tab) — VFP tooltip "Print Current
// Invoice". sp_flower_invoice_report, verified live (ws_invoice.frx).
const COLUMNS: ReportColumn[] = [
    { key: "lote",        label: "Lot",       width: 0.9 },
    { key: "description",  label: "Product",   width: 2.2 },
    { key: "case_sh",      label: "Case",      width: 1 },
    { key: "box_qty",      label: "Boxes",     width: 0.7, align: "right", render: r => fmtI(r.box_qty) },
    { key: "units_x_box",  label: "UxBox",     width: 0.7, align: "right", render: r => fmtI(r.units_x_box) },
    { key: "price",        label: "Price",     width: 0.8, align: "right", render: r => fmt2(r.price) },
    { key: "ext_price",    label: "Ext.Price", width: 0.9, align: "right", render: r => fmt2(r.ext_price) },
];

const GROUP: ReportGroup = {
    key: "invoice_uq",
    label: () => "Line Items",
    totals: ["ext_price"],
    totalLabel: () => "TOTAL",
};

export async function GET(req: NextRequest) {
    const invoice_uq = req.nextUrl.searchParams.get("invoice_uq");
    if (!invoice_uq) return new Response("Missing invoice_uq", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_invoice_report", { invoice_uq }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const first = rows[0];
    const subtitle = first
        ? `Invoice #${t(first.invoice_no)} — ${t(first.customer)} — ${fmtDate(first.invoice_date)}`
        : undefined;

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title="INVOICE"
            subtitle={subtitle}
            columns={COLUMNS}
            rows={rows}
            group={GROUP}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="invoice_${t(first?.invoice_no) || invoice_uq}.pdf"`,
        },
    });
}
