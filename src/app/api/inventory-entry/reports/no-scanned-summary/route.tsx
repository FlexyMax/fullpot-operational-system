import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => { const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };

const COLUMNS: ReportColumn[] = [
    { key: "awbcode", label: "AWB",     width: 1.5 },
    { key: "awbdate", label: "AWBDate", width: 1.5, render: r => fmtDate(r.awbdate) },
    { key: "vendor",  label: "Vendor",  width: 2 },
    { key: "to_scan", label: "To Scan", width: 1, align: "right", render: r => fmtI(r.to_scan) },
];

export async function GET() {
    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_box_control_no_scan_summary_report", {}),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const title = t(rows[0]?.tituloreporte) || "NO SCAN SUMMARY REPORT";

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle="Last 10 days"
            columns={COLUMNS}
            rows={rows}
            group={{
                key: "agency",
                label: row => `Cargo: ${t(row.agency)}`,
                totals: ["to_scan"],
                totalLabel: row => `TOTAL: ${t(row.agency)}`,
            }}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="no_scanned_summary.pdf"`,
        },
    });
}
