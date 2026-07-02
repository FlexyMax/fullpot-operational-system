import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";

type P = { params: Promise<{ pack_uq: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);

export async function POST(req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_to_whouse", {
            lcpacking_uq:  pack_uq,
            lcwhouse_uq:   str(b.whouse_uq, 8),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Insert", "flower_packing_stock", pack_uq, "Send to WH").catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
