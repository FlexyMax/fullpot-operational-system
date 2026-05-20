import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const b = await req.json();
    if (!b.awbcode) return NextResponse.json({ success: false, error: "AWB code is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_awbs_varieties_insert", { lcawbcode: b.awbcode });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
