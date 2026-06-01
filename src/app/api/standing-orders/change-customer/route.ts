import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { so_uq, shipto_uq, carrier_uq } = await req.json();
        if (!so_uq) return NextResponse.json({ error: "so_uq required" }, { status: 400 });
        const r = await executeProcedure("sp_flower_standing_orders_change_customer", {
            lcso_uq:     so_uq,
            lcshipto_uq: shipto_uq || "",
            lccarrier_uq: carrier_uq || null,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
