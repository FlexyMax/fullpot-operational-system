import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_customers_shipto_carriers_update", {
            lcshipto_carrier_uq: unico,
            lcshipto_uq:   txt(b.shipto_uq),
            lccarrier_uq:  txt(b.carrier_uq),
            lcaccount:     txt(b.account),
            lczone:        txt(b.zone),
            llmon: bit(b.mon), lltue: bit(b.tue), llwed: bit(b.wed), llthu: bit(b.thu),
            llfri: bit(b.fri), llsat: bit(b.sat), llsun: bit(b.sun),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Carrier updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_customers_shipto_carriers_delete", { lcshipto_carrier_uq: unico });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Carrier deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
