import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US") : ""; };

// VFP's btn_print_history ("History" button, tooltip "View lot history") — combines sales
// (invoices this box was sold in) and warehouse adjustments into one printable history,
// via sp_flower_packing_box_search_invoice_box (verified live).
const COLUMNS: ReportColumn[] = [
    { key: "type",            label: "Type",      width: 0.9 },
    { key: "add_date",        label: "Date",      width: 1.1, render: r => fmtDate(r.add_date) },
    { key: "lote",            label: "Lot",       width: 0.9, align: "right" },
    { key: "description",     label: "Product",   width: 2.3 },
    { key: "box_qty",         label: "Qty",        width: 0.7, align: "right", render: r => fmtI(r.box_qty) },
    { key: "invoice_no",      label: "Ref #",      width: 1, render: r => t(r.invoice_no) },
    { key: "customer_reason", label: "Customer / Reason", width: 1.8 },
    { key: "price",           label: "Price",      width: 0.9, align: "right", render: r => fmt(r.price) },
    { key: "message",         label: "Detail",     width: 3 },
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
    const title = t(rows[0]?.titulo_reporte) || "Packing Box History";
    const lote = t(rows[0]?.lote);

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={lote ? `Lot: ${lote}` : undefined}
            columns={COLUMNS}
            rows={rows}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="box_${box_uq}_history.pdf"`,
        },
    });
}
