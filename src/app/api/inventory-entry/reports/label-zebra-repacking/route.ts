import { NextRequest } from "next/server";
import { executeProcedure } from "@/lib/db";

const t = (v: any) => String(v ?? "").trim();

// GET /api/inventory-entry/reports/label-zebra-repacking?date=X&awbcode=Y&pack_uq=Z&box_uq=W(or %)
// "RPK" button — raw ZPL text for repacking labels.
export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const date = sp.get("date");
    const awbcode = sp.get("awbcode") || "%";
    const pack_uq = sp.get("pack_uq") || "%";
    const box_uq = sp.get("box_uq") || "%";
    if (!date) return new Response("Missing date", { status: 400 });

    const r = await executeProcedure("sp_flower_packing_label_zebra_repacking", {
        ldawbdate: new Date(date),
        lcawbcode: awbcode,
        lcpacking_uq: pack_uq,
        lcpkbox_uq: box_uq,
    });
    const rows = r.recordset ?? [];
    if (rows.length === 0) return new Response("No labels found.", { status: 404 });

    const body = rows.map((row: any) => t(row.label)).join("\n");
    const filename = t(rows[0]?.lcfile) || "labels_rpk.txt";

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
