import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { ReportPDF, type ReportColumn } from "@/components/reports/ReportPDF";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmt2 = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const caseBreakdown = (r: any) => {
    const parts: string[] = [];
    const pairs: [string, string][] = [["rotulo_case_1", "case_1"], ["rotulo_case_50", "case_50"], ["rotulo_case_25", "case_25"], ["rotulo_case_125", "case_125"]];
    for (const [labelKey, qtyKey] of pairs) {
        const label = t(r[labelKey]);
        const qty = parseInt(r[qtyKey] ?? 0);
        if (label && qty > 0) parts.push(`${label}: ${qty.toLocaleString("en-US")}`);
    }
    return parts.join("  •  ") || "—";
};

const COLUMNS: ReportColumn[] = [
    { key: "cnee",       label: "CNEE",       width: 2 },
    { key: "grower",     label: "Vendor",     width: 1.8 },
    { key: "hawb",       label: "HAWB",       width: 1 },
    { key: "ship_name",  label: "Ship To",    width: 2 },
    { key: "carrier",    label: "Carrier",    width: 1.5 },
    { key: "case_breakdown", label: "Case Breakdown", width: 2.5, render: caseBreakdown },
    { key: "full_boxes", label: "Full Boxes", width: 1, align: "right", render: r => fmt2(r.full_boxes) },
    { key: "pieces",     label: "Pieces",     width: 1, align: "right", render: r => fmtI(r.pieces) },
];

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const date = sp.get("date");
    const awb = sp.get("awb");
    if (!date || !awb) return new Response("Missing date or awb", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_packing_awb_whouse_instructions_report", {
            ldawb_date: new Date(date), lcawbcode: awb,
        }),
        getCompanyInfo(),
    ]);

    const rows = r.recordset ?? [];
    const first = rows[0];
    const title = t(first?.titulo_reporte) || "SHIPMENT CONFIRMATION";
    const subtitleParts = [
        `AWB: ${t(first?.awbcode) || awb}`,
        first?.airline && `Airline: ${t(first.airline)}`,
        first?.awbdate && `Flight Date: ${t(first.awbdate)}`,
        first && `Total Pieces: ${fmtI(first.total_pieces)}  •  Total Full Boxes: ${fmt2(first.total_full)}  •  Total KG: ${fmt2(first.total_kg)}`,
    ].filter(Boolean);

    const buffer = await renderToBuffer(
        <ReportPDF
            company={company}
            title={title}
            subtitle={subtitleParts.join("   |   ")}
            columns={COLUMNS}
            rows={rows}
        />
    );

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="instructions_${awb}.pdf"`,
        },
    });
}
