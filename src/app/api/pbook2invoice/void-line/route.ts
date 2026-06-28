import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const unico = String(b.unico ?? "");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const salProfile = await executeProcedure("sp_flower_salesman_uq", {
            lcunico: "%",
            lcuser_uq: (session as any).user?.id ?? "",
        });
        const salesman_uq = salProfile.recordset?.[0]?.unico ?? "";
        const r = await executeProcedure("sp_flower_prebook_box_void", {
            lcunico: unico,
            lcsalesman_uq: salesman_uq,
            llvoid: 1,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
