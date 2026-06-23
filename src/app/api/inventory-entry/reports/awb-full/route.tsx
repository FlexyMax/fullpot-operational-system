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
    { key: "lote",          label: "Lot",      width: 1.2 },
    { key: "description",   label: "Product",  width: 2.5 },
    { key: "box_date",      label: "Date",     width: 1.2, render: r => fmtDate(r.box_date) },
    { key: "case_sh",       label: "Case",     width: 1 },
    { key: "tunits_x_box",  label: "UxCase",   width: 1, align: "right", render: r => fmtI(r.tunits_x_box) },
    { key: "box_qty",       label: "QTY REC.", width: 1, align: "right", render: r => fmtI(r.box_qty) },
    { key: "fullboxes",     label: "QTY FB",   width: 1, align: "right", render: r => fmt(r.fullboxes) },
    { key: "bunches",       label: "Bunches",  width: 1, align: "right", render: r => fmtI(r.bunches) },
    { key: "total_units",   label: "T.Units",  width: 1, align: "right", render: r => fmtI(r.total_units) },
    { key: "unit_cost",     label: "U.Cost",   width: 1, align: "right", render: r => fmt(r.unit_cost) },
    { key: "total_cost",    label: "Ext.Cost", width: 1.2, align: "right", render: r => fmt(r.total_cost) },
    { key: "stock",         label: "Stock",    width: 1, align: "right", render: r => fmtI(r.stock) },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const lcawb = sp.get("awb");
    if (!lcawb) return new Response("Missing awb", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_awb_report", { lcawb }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const title = t(rows[0]?.titulo_reporte) || "AWB ARRIVED";

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={`AWB: ${lcawb}`}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "grower",
                label: row => `${t(row.grower)} (${t(row.farm)})`,
                totals: ["box_qty", "fullboxes", "bunches", "total_units", "total_cost", "stock"],
                totalLabel: row => `TOTAL: ${t(row.farm)} ${t(row.grower)}`,
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="awb_${lcawb}.pdf"`,
        },
    });
}
