import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_update_new", {
            lcunico:       unico,
            lcawbcode:     b.awbcode      ?? "",
            lcdescription: b.description  ?? "",
            lnprice:       parseFloat(b.price)       || 0,
            lnf_cost_x_u:  parseFloat(b.f_cost_x_u)  || 0,
            lnc_cost_x_u:  parseFloat(b.c_cost_x_u)  || 0,
            lnt_charges:   parseFloat(b.t_charges)   || 0,
            lnflower_cost: parseFloat(b.flower_cost) || 0,
            lnunits_x_box: parseFloat(b.units_x_box) || 0,
            lnbox_qty:     parseFloat(b.box_qty)     || 0,
            lnlote:        parseFloat(b.lote)        || 0,
            lccombo_awb:   b.combo_awb    ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
