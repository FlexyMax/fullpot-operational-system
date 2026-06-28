import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0, 10); return isNaN(n) ? "" : n.toLocaleString("en-US"); };

// "Without Invoice" (Customers panel) — VFP tooltip "Print prebook without
// invoice". sp_flower_prebook_box_without_invoice, verified live.
const COLUMNS: ReportColumn[] = [
    { key: "pbook_no",   label: "Pbook",     width: 0.8, render: r => t(r.pbook_no) },
    { key: "cporder_no", label: "Cust. PO",  width: 1 },
    { key: "description", label: "Product", width: 2 },
    { key: "qty_order",  label: "Boxes",     width: 0.7, align: "right", render: r => fmtI(r.qty_order) },
    { key: "in_invoice", label: "Invoiced",  width: 0.8, align: "right", render: r => fmtI(r.in_invoice) },
    { key: "whouse",     label: "Warehouse", width: 1.2 },
    { key: "shipto",     label: "Ship To",   width: 1.4 },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const customer_uq = sp.get("customer_uq") || "%";
    const date = sp.get("date");
    const mode = sp.get("mode") || "delivery";
    if (!date) return new Response("Missing date", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_prebook_box_without_invoice", {
            lccustomer_uq: customer_uq,
            lddate_filter: new Date(date),
            llpb_date: mode === "delivery" ? 1 : 0,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const first = rows[0];
    const title = t(first?.titulo_reporte) || "Prebook Without Invoice";

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={`Date: ${t(date)}`}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "customer",
                label: row => t(row.customer),
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="prebook_without_invoice.pdf"`,
        },
    });
}
