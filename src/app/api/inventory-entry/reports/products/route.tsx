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
    { key: "description",   label: "Product",    width: 3 },
    { key: "total_pieces",  label: "Pieces",      width: 1, align: "right", render: r => fmtI(r.total_pieces) },
    { key: "total_boxes",   label: "Full Boxes",  width: 1, align: "right", render: r => fmt(r.total_boxes) },
    { key: "total_bunches", label: "Bunches",      width: 1, align: "right", render: r => fmtI(r.total_bunches) },
    { key: "units_bunch",   label: "U.Bunch",      width: 1, align: "right", render: r => fmtI(r.units_bunch) },
    { key: "total_stems",   label: "Stems",        width: 1, align: "right", render: r => fmtI(r.total_stems) },
    { key: "unit_price",    label: "U.Price",      width: 1, align: "right", render: r => fmt(r.unit_price) },
    { key: "ext_price",     label: "Total",        width: 1.2, align: "right", render: r => fmt(r.ext_price) },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const date = sp.get("date");
    if (!date) return new Response("Missing date", { status: 400 });
    const lcawbcode = sp.get("awb") || "%";
    const lcgrower_uq = sp.get("grower_uq") || "%";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_arrived_products_report", {
            lddate: new Date(date), lcawbcode, lcgrower_uq,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const title = t(rows[0]?.tituloreporte) || "ARRIVED PRODUCTS";

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={`Date: ${fmtDate(date)}${lcawbcode !== "%" ? `  •  AWB: ${lcawbcode}` : ""}`}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "warehouse",
                label: row => `Warehouse: ${t(row.warehouse)}`,
                totals: ["total_pieces", "total_boxes", "total_bunches", "total_stems", "ext_price"],
                totalLabel: row => `TOTAL: ${t(row.warehouse)}`,
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="products_${date}.pdf"`,
        },
    });
}
