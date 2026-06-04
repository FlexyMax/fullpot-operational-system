import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// DELETE /api/pos/invoice/line/delete { unico }
// sp_flower_invoice_box_delete(@lcunico, @lcuser_uq)
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { unico } = await req.json();
        const userId = (session.user as any).id ?? "";
        const r = await executeProcedure("sp_flower_invoice_box_delete", {
            lcunico:   unico,
            lcuser_uq: userId,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.error === true)
            return NextResponse.json({ success: false, error: row.message || row.mensaje || "Failed" }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
