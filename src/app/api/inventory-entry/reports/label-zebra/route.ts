import { NextRequest } from "next/server";
import { executeProcedure } from "@/lib/db";

const t = (v: any) => String(v ?? "").trim();

// GET /api/inventory-entry/reports/label-zebra?pack_uq=X&box_uq=Y(or %)
// Returns the raw ZPL text file the original VFP "Z300"/"Zebra by Lot" buttons generated,
// meant to be sent as-is to a Zebra thermal printer (raw/passthrough mode).
export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const pack_uq = sp.get("pack_uq") || "%";
    const box_uq = sp.get("box_uq") || "%";

    const r = await executeProcedure("sp_flower_packing_label_zebra", {
        lcpacking_uq: pack_uq,
        lcpkbox_uq: box_uq,
        lcpob_uq: "%",
        lcpobd_uq: "%",
    });
    const rows = r.recordset ?? [];
    if (rows.length === 0) return new Response("No labels found.", { status: 404 });

    const body = rows.map((row: any) => t(row.label)).join("\n");
    const filename = t(rows[0]?.lcfile) || "labels_zebra.txt";

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
