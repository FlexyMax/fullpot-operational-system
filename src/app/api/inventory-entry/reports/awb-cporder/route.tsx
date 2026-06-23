import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => { const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };

const COLUMNS: ReportColumn[] = [
    { key: "lote",                label: "Lot",       width: 1.2 },
    { key: "description",         label: "Product",   width: 3 },
    { key: "box_date",            label: "Date",       width: 1.2, render: r => fmtDate(r.box_date) },
    { key: "case_sh",             label: "Case",       width: 1 },
    { key: "tunits_x_box",        label: "UxBox",      width: 1, align: "right", render: r => fmtI(r.tunits_x_box) },
    { key: "box_qty",             label: "Qty",        width: 1, align: "right", render: r => fmtI(r.box_qty) },
    { key: "total_units",         label: "T.Units",    width: 1, align: "right", render: r => fmtI(r.total_units) },
    { key: "box_id",              label: "Box ID",     width: 1.2 },
    { key: "farm_invoice",        label: "Invoice",    width: 1.2 },
    { key: "pbook_shipping_date", label: "Ship.Date",  width: 1.2, render: r => fmtDate(r.pbook_shipping_date) },
    { key: "grower",              label: "Vendor",     width: 1.5 },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const date = sp.get("date");
    if (!date) return new Response("Missing date", { status: 400 });
    const lcawb = sp.get("awb") || "%";
    const lcpacking_uq = sp.get("pack_uq") || "%";

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_awb_cporder_report", {
            ldpacking_date: new Date(date), lcawb, lcpacking_uq,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const title = t(rows[0]?.titulo_reporte) || "AWB CUSTOMER ORDER";

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={`Date: ${fmtDate(date)}${lcawb !== "%" ? `  •  AWB: ${lcawb}` : ""}`}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "cporder_no",
                label: row => `Cust. PO ${t(row.cporder_no)}  —  ${t(row.customer)}`,
                totals: ["box_qty", "total_units"],
                totalLabel: row => `TOTAL: ${t(row.cporder_no)}`,
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="awb_cporder_${date}.pdf"`,
        },
    });
}
