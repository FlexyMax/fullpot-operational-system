import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => { const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };

const COLUMNS: ReportColumn[] = [
    { key: "lote",        label: "Lot",      width: 1.2 },
    { key: "description", label: "Product",  width: 3 },
    { key: "case_sh",     label: "Case",     width: 1 },
    { key: "box_qty",     label: "QTY REC.", width: 1, align: "right", render: r => fmtI(r.box_qty) },
    { key: "boxes_in",    label: "Scanned",  width: 1, align: "right", render: r => fmtI(r.boxes_in) },
    { key: "to_scan",     label: "To Scan",  width: 1, align: "right", render: r => fmtI(r.to_scan) },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const date = sp.get("date");
    const lcpacking_uq = sp.get("pack_uq") || null;
    if (!date) return new Response("Missing date", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_box_control_no_scan_report", {
            ldawbdate: new Date(date), lcpacking_uq,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const title = t(rows[0]?.tituloreporte) || "SCAN DISCREPANCY REPORT";

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={`Date: ${fmtDate(date)}`}
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "awbcode",
                label: row => `AWB ${t(row.awbcode)}  —  ${t(row.vendor)}`,
                totals: ["box_qty", "boxes_in", "to_scan"],
                totalLabel: row => `TOTAL: AWB ${t(row.awbcode)}`,
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="no_scanned_${date}.pdf"`,
        },
    });
}
