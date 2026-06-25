import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { LabelGridPDF } from "@/components/reports/LabelGridPDF";

// GET /api/inventory-entry/reports/label-laser?pack_uq=X
// "Label Laser" button — real PDF, printed on plain paper via a regular (laser) printer.
export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const pack_uq = sp.get("pack_uq");
    if (!pack_uq) return new Response("Missing pack_uq", { status: 400 });

    const r = await executeProcedure("sp_flower_packing_labels_lasser_report", { lcpacking_uq: pack_uq });
    const rows = r.recordset ?? [];

    const buffer = await renderToBuffer(<LabelGridPDF rows={rows} />);

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="labels_${pack_uq}.pdf"`,
        },
    });
}
