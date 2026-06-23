import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => { const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };

const COLUMNS: ReportColumn[] = [
    { key: "lote",         label: "Lot",      width: 1.2 },
    { key: "stock",        label: "Stock",    width: 1, align: "right", render: r => fmtI(r.stock) },
    { key: "description",  label: "Product",  width: 3 },
    { key: "box_date",     label: "Date",     width: 1.2, render: r => fmtDate(r.box_date) },
    { key: "qty_sale",     label: "Sold",     width: 1, align: "right", render: r => fmtI(r.qty_sale) },
    { key: "case_sh",      label: "Case",     width: 1 },
    { key: "tunits_x_box", label: "UxBox",    width: 1, align: "right", render: r => fmtI(r.tunits_x_box) },
    { key: "box_qty",      label: "Qty",      width: 1, align: "right", render: r => fmtI(r.box_qty) },
    { key: "cost",         label: "Cost",     width: 1.2, align: "right", render: r => fmt(r.cost) },
    { key: "total",        label: "Total",    width: 1.2, align: "right", render: r => fmt(r.total) },
    { key: "invoice_no",   label: "Invoice",  width: 1.2 },
    { key: "scan_pieces",  label: "Scan",     width: 1, align: "right", render: r => fmtI(r.scan_pieces) },
    { key: "pending_scan", label: "Pending",  width: 1, align: "right", render: r => fmtI(r.pending_scan) },
    { key: "customer",     label: "Customer", width: 1.5 },
    { key: "details",      label: "Details",  width: 2 },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const date = sp.get("date");
    if (!date) return new Response("Missing date", { status: 400 });
    const awbcode = sp.get("awb") || "%";
    const lcpack_uq = sp.get("pack_uq") || "%";
    const lcwphysical_uq = sp.get("wphysical_uq") || "%";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_arrived", {
            lddate: new Date(date), awbcode, lcpack_uq, lcwphysical_uq,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const title = t(rows[0]?.titulo_reporte) || "ARRIVED PACKING BOX";

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={`Date: ${fmtDate(date)}${awbcode !== "%" ? `  •  AWB: ${awbcode}` : ""}`}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "unico",
                label: row => `${t(row.grower)} (${t(row.farm)})  —  AWB ${t(row.awbcode)}`,
                totals: ["box_qty", "scan_pieces", "pending_scan", "total"],
                totalLabel: row => `TOTAL: ${t(row.farm)} ${t(row.grower)}`,
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="packing_arrived_${date}.pdf"`,
        },
    });
}
