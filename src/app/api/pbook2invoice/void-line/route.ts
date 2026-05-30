import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const unico         = String(b.unico ?? "");
    const boxes_delete  = parseInt(b.boxes_delete ?? 1);
    const user_uq       = (session as any).user?.id ?? "";
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_invoice_box_delete_part", {
            lcunico:         unico,
            lnboxes_delete:  boxes_delete,
            lcuser_uq:       user_uq,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
