import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ pack_uq: string }> };

// POST /api/inventory-entry/packings/[pack_uq]/send-label
// "PDF Label" button. NB: the actual email-send block in this stored procedure is
// commented out in the live database — this only flips flower_packing.sent_labels = 1.
export async function POST(_req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_packing_send_label_by_email", { lc_pack_uq: pack_uq });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
