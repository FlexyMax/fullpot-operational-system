import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const stock_uq = String(b.stock_uq ?? "");
    const boxes_delete = parseInt(b.boxes_delete ?? 0, 10);
    const reason_uq = String(b.reason_uq ?? "");
    if (!stock_uq) return NextResponse.json({ error: "stock_uq required" }, { status: 400 });
    if (!boxes_delete || boxes_delete <= 0) return NextResponse.json({ error: "boxes_delete required" }, { status: 400 });
    if (!reason_uq) return NextResponse.json({ error: "reason_uq required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_packing_stock_unassign", {
            lcstock_uq: stock_uq,
            lnboxes_delete: boxes_delete,
            lcreason_uq: reason_uq,
            lcnewpbook_d_uq: null,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
