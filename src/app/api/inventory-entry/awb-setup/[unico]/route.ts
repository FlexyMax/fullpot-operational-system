import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ unico: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_awb_setup_line", { lcunico: unico });
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_awbs_setup_update", {
            lcunico:         unico,
            lcawbcode:       str(b.awbcode,      20),
            lddate_invo:     b.date_invo    ? new Date(b.date_invo)   : new Date(),
            lcairline_uq:    str(b.airline_uq,    8),
            lnfreight_x_bx:  num(b.freight_x_bx),
            lnduties_x_bx:   num(b.duties_x_bx),
            lnbroker_x_bx:   num(b.broker_x_bx),
            lnhandling_x_bx: num(b.handling_x_bx),
            lnocharges_x_bx: num(b.ocharges_x_bx),
            lcorigin_uq:     str(b.origin_uq,     8),
            lcdest_uq:       str(b.dest_uq,       8),
            lcuser_uq:       str(b.user_uq,       8),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json().catch(() => ({}));
    try {
        const r = await executeProcedure("sp_flower_awbs_setup_delete", {
            lcunico:   unico,
            lcuser_uq: str(b.user_uq, 8),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
