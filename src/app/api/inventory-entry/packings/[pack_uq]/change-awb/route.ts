import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ pack_uq: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);

export async function POST(req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_awb_change", {
            lcunico:      pack_uq,
            lcawbcode:    str(b.awbcode,    20),
            lcairline_uq: str(b.airline_uq,  8),
            ldinvo_date:  b.date_invo ? new Date(b.date_invo) : new Date(),
            lcuser_uq:    str(b.user_uq, 8),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
