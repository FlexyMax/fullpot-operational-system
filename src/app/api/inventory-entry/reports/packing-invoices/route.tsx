import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US") : ""; };

// VFP's "Invoices" button (AWB Search toolbar, printer icon) — the real report is the
// packing's sales breakdown by lot, via sp_flower_packing_invoices_report (verified live),
// NOT a tab switch. Column layout confirmed from ws_packing_invoices.FRT: grouped by lot
// (Lot/Box# | Product | Case | Boxes | BxCase | UxBunch | UxCase | Total), with a detail
// table per lot (Customer | Invoice | Date | Boxes) and a "TOTAL SOLD" subtotal.
const COLUMNS: ReportColumn[] = [
    { key: "customer",    label: "Customer", width: 2.2 },
    { key: "invoice_no",  label: "Invoice",   width: 1, render: r => t(r.invoice_no) },
    { key: "invoice_date", label: "Date",     width: 1.2, render: r => fmtDate(r.invoice_date) },
    { key: "sold_boxes",  label: "Boxes",      width: 0.8, align: "right", render: r => fmtI(r.sold_boxes) },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const pack_uq = sp.get("pack_uq");
    if (!pack_uq) return new Response("Missing pack_uq", { status: 400 });
    const box_uq = sp.get("box_uq") || undefined;

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_invoices_report", { lcpack_uq: pack_uq, lcpk_box_uq: box_uq }),
        getCompanyInfo(),
    ]);

    // Boxes that haven't sold yet come back with invoice_no = 0 (RIGHT OUTER JOIN in the
    // proc) — drop those detail lines; this is a sales report, not an inventory listing.
    const rows = (r.recordset ?? []).filter((row: any) => Number(row.invoice_no) > 0);
    const first = (r.recordset ?? [])[0];
    const title = t(first?.titulo_reporte) || "Inventory / Sales Report";
    const subtitle = first
        ? `Vendor: ${t(first.grower)}  |  AWB: ${t(first.awbcode)}  |  Date: ${t(first.available_date)}`
        : undefined;

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={subtitle}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "pk_box_uq",
                label: row => `Lot ${t(row.lote)} — ${t(row.description)}  |  Case: ${t(row.case_sh)}  |  Boxes: ${fmtI(row.box_qty)}  |  BxCase: ${fmtI(row.packs_box)}  |  UxBunch: ${fmtI(row.up_x_pack)}  |  UxCase: ${fmtI(row.tunits_x_box)}  |  Total: ${fmtI(row.total_units)}`,
                totals: ["sold_boxes"],
                totalLabel: () => "TOTAL SOLD",
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${t(first?.pdf) || `packing_${pack_uq}_invoices.pdf`}"`,
        },
    });
}
