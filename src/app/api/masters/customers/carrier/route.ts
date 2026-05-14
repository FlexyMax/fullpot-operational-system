import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);

export async function GET(req: NextRequest) {
    const cust_uq   = req.nextUrl.searchParams.get("cust_uq") || "";
    const shipto_uq = req.nextUrl.searchParams.get("shipto_uq") || "";
    try {
        const r = await executeProcedure("sp_flower_customer_carriers", { customer_uq: cust_uq, shipto_uq });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_customers_shipto_carriers_insert", {
            lccustomer_uq: txt(b.customer_uq),
            lcshipto_uq:   txt(b.shipto_uq),
            lccarrier_uq:  txt(b.carrier_uq),
            lcaccount:     txt(b.account),
            lczone:        txt(b.zone),
            llmon: bit(b.mon), lltue: bit(b.tue), llwed: bit(b.wed), llthu: bit(b.thu),
            llfri: bit(b.fri), llsat: bit(b.sat), llsun: bit(b.sun),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message || "Carrier added." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
