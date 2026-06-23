import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => { const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };

const COLUMNS: ReportColumn[] = [
    { key: "lote",          label: "Lot",       width: 1.2 },
    { key: "description",   label: "Product",   width: 2.5 },
    { key: "case_sh",       label: "Case",      width: 1 },
    { key: "qty",           label: "Qty",       width: 1, align: "right", render: r => fmtI(r.qty) },
    { key: "reason",        label: "Reason",    width: 1.5 },
    { key: "customer",      label: "Customer",  width: 1.5 },
    { key: "pbook_no",      label: "Pbook",     width: 1 },
    { key: "cust_po",       label: "Cust.PO",   width: 1.2 },
    { key: "phy_warehouse", label: "WHouse",    width: 1.5 },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const date = sp.get("date");
    if (!date) return new Response("Missing date", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_box_unconfirmed_report", { lcawb_date: new Date(date) }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const title = t(rows[0]?.titulo_reporte) || "DELAYED INVENTORY REPORT";

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={`Date: ${fmtDate(date)}`}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "awbcode",
                label: row => `AWB ${t(row.awbcode)}`,
                totals: ["qty"],
                totalLabel: row => `TOTAL: AWB ${t(row.awbcode)}`,
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="delayed_${date}.pdf"`,
        },
    });
}
