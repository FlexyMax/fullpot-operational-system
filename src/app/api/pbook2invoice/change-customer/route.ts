import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: NextRequest) {
    const b = await req.json();
    const pbook_uq = String(b.pbook_uq ?? "");
    const shipto_uq = String(b.shipto_uq ?? "");
    const carrier_uq = String(b.carrier_uq ?? "");
    if (!pbook_uq) return NextResponse.json({ error: "pbook_uq required" }, { status: 400 });
    if (!shipto_uq || !carrier_uq) return NextResponse.json({ error: "Please select one customer." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_prebook_change_customer", {
            lcpbook_uq: pbook_uq,
            lcshipto_uq: shipto_uq,
            lccarrier_uq: carrier_uq,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
