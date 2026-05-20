import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// sp_flower_awbs_varieties_update_mpf params (verified):
// @lcawbcode [varchar], @lcentry_code [varchar], @lcmpf [varchar]  ← MPF is varchar

export async function PUT(req: Request) {
    const b = await req.json();
    if (!b.awbcode)    return NextResponse.json({ success: false, error: "AWB code is required." }, { status: 400 });
    if (!b.entry_code) return NextResponse.json({ success: false, error: "Entry code is required." }, { status: 400 });
    if (!b.mpf && b.mpf !== 0) return NextResponse.json({ success: false, error: "MPF value is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_awbs_varieties_update_mpf", {
            lcawbcode:    b.awbcode,
            lcentry_code: b.entry_code,
            lcmpf:        String(b.mpf),   // SP expects varchar
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
