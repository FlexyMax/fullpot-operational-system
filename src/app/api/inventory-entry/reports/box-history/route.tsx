import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US") : ""; };

// VFP's btn_print_history ("History" button, on AWB's Packings' Boxes Detail toolbar,
// tooltip "View lot history") — combines sales and warehouse adjustments for one box into
// a printable history, via sp_flower_packing_box_search_invoice_box (verified live).
// Column layout confirmed directly from ws_packing_box_history.FRT: Customer | Document |
// Qty | Price | Date, grouped by type (SALES / ADJUSTS) with a "Total: {type}" subtotal.
const COLUMNS: ReportColumn[] = [
    { key: "customer", label: "Customer",  width: 2.4 },
    { key: "invoice_no", label: "Document", width: 1.1, render: r => t(r.invoice_no) },
    { key: "box_qty",  label: "Qty",        width: 0.8, align: "right", render: r => fmtI(r.box_qty) },
    { key: "price",    label: "Price",      width: 1,   align: "right", render: r => fmt(r.price) },
    { key: "add_date", label: "Date",       width: 1.3, render: r => fmtDate(r.add_date) },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const box_uq = sp.get("box_uq");
    if (!box_uq) return new Response("Missing box_uq", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_box_search_invoice_box", { lcpkbox_uq: box_uq }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const first = rows[0];
    const title = t(first?.titulo_reporte) || "Packing Box History";
    const subtitle = first
        ? `${t(first.description)}  |  Vendor: ${t(first.grower)}  |  AWB: ${t(first.awbcode)} (${t(first.awbdate)})  |  Lot: ${t(first.lote)}  |  Total In: ${t(first.total_in)}`
        : undefined;

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={subtitle}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "type",
                label: row => t(row.type),
                totals: ["box_qty"],
                totalLabel: row => `Total: ${t(row.type)}`,
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="box_${box_uq}_history.pdf"`,
        },
    });
}
