import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };

const COLUMNS: ReportColumn[] = [
    { key: "lote",          label: "Lot",       width: 1.2 },
    { key: "description",   label: "Product",   width: 2.5 },
    { key: "case_sh",       label: "Case",      width: 1 },
    { key: "bunches_case",  label: "BxCase",    width: 1, align: "right", render: r => fmtI(r.bunches_case) },
    { key: "stems_bunche",  label: "UxBunch",   width: 1, align: "right", render: r => fmtI(r.stems_bunche) },
    { key: "box_qty",       label: "Boxes",     width: 1, align: "right", render: r => fmtI(r.box_qty) },
    { key: "total_units",   label: "Units",     width: 1, align: "right", render: r => fmtI(r.total_units) },
    { key: "unit_price",    label: "Price",     width: 1, align: "right", render: r => fmt(r.unit_price) },
    { key: "total",         label: "Total",     width: 1.2, align: "right", render: r => fmt(r.total) },
    { key: "invoice_no",    label: "Invoice",   width: 1.2 },
    { key: "customer",      label: "Customer",  width: 1.5 },
    { key: "sales_qty",     label: "Sales Qty", width: 1, align: "right", render: r => fmtI(r.sales_qty) },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const date = sp.get("date");
    if (!date) return new Response("Missing date", { status: 400 });
    const awbcode = sp.get("awb") || "%";
    const lcpack_uq = sp.get("pack_uq") || "%";
    const lldry = sp.get("dry") === "1";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_income_note_report", {
            lddate: new Date(date), awbcode, lcpack_uq, lldry,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const title = t(rows[0]?.titulo_reporte) || "Cut Off Report";

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={awbcode !== "%" ? `AWB: ${awbcode}` : undefined}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "pack_uq",
                label: row => `${t(row.grower)}  —  ${t(row.awbdate)}`,
                totals: ["box_qty", "total_units", "total", "sales_qty"],
                totalLabel: row => `TOTAL: ${t(row.grower)}`,
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="cut_off_${date}.pdf"`,
        },
    });
}
