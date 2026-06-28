import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0, 10); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US") : ""; };

// "Pick List" (main bar + Invoiced Prebooks tab) — VFP tooltip "Print pick
// list". sp_flower_invoice_picklist, verified live (ws_whouse_picklist_sunflower.frx).
const COLUMNS: ReportColumn[] = [
    { key: "box_id",   label: "Box Id",  width: 1 },
    { key: "description", label: "Product", width: 2.2 },
    { key: "case_sh",  label: "Case",    width: 1 },
    { key: "box_qty",  label: "Boxes",   width: 0.7, align: "right", render: r => fmtI(r.box_qty) },
    { key: "lote",     label: "Lot",     width: 0.9 },
    { key: "farm",     label: "Vendor",  width: 1.4 },
    { key: "status",   label: "Status",  width: 0.8 },
];

export async function GET(req: NextRequest) {
    const invoice_uq = req.nextUrl.searchParams.get("invoice_uq");
    if (!invoice_uq) return new Response("Missing invoice_uq", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_invoice_picklist", { invoice_uq }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const first = rows[0];
    const subtitle = first
        ? `Invoice #${t(first.invoice_no)} — ${t(first.customer)} — ${fmtDate(first.invoice_date)}`
        : undefined;

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title="PICK LIST"
            subtitle={subtitle}
            columns={COLUMNS}
            rows={rows}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="pick_list_${t(first?.invoice_no) || invoice_uq}.pdf"`,
        },
    });
}
