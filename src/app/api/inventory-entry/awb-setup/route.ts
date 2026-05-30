import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };

// GET /api/inventory-entry/awb-setup?awbcode=XXX&date=2026-05-27
export async function GET(req: NextRequest) {
    const awbcode = req.nextUrl.searchParams.get("awbcode") || "";
    const date    = req.nextUrl.searchParams.get("date")    || new Date().toISOString().split("T")[0];
    try {
        const r = await executeProcedure("sp_flower_awb_setup_search", {
            lcawbcode: awbcode,
            lddate:    new Date(date),
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/inventory-entry/awb-setup
export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_awbs_setup_insert", {
            lcawbcode:      str(b.awbcode,     20),
            lddate_invo:    b.date_invo   ? new Date(b.date_invo)   : new Date(),
            lcairline_uq:   str(b.airline_uq,   8),
            lnfreight_x_bx: num(b.freight_x_bx),
            lnduties_x_bx:  num(b.duties_x_bx),
            lnbroker_x_bx:  num(b.broker_x_bx),
            lnhandling_x_bx: num(b.handling_x_bx),
            lnocharges_x_bx: num(b.ocharges_x_bx),
            lcorigin_uq:    str(b.origin_uq,    8),
            lcdest_uq:      str(b.dest_uq,      8),
            lcuser_uq:      str(b.user_uq,      8),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        const unico = row?.UNICO ?? row?.unico ?? null;
        return NextResponse.json({ success: true, unico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
