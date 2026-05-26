import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ unico: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const bit = (v: any) => (v ? 1 : 0);

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_packing_box_uq", { lcunico: unico });
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_update_new", {
            lcunico:          unico,
            lcproduct_uq:     str(b.product_uq,    8),
            lccase_uq:        str(b.case_uq,        8),
            lccustomer_uq:    str(b.customer_uq,    8),
            lccporder_no:     str(b.cporder_no,    20),
            lnbox_qty:        int(b.box_qty),
            lnup_x_case:      int(b.up_x_case),
            lnbunches_x_case: int(b.bunches_x_case),
            lnunits_x_bunch:  int(b.units_x_bunch),
            lntotal_units:    int(b.total_units),
            lnlote:           int(b.lote),
            lccut_point:      str(b.cut_point,     20),
            lnprice:          num(b.price),
            lnf_cost_x_u:     num(b.f_cost_x_u),
            lnc_cost_x_u:     num(b.c_cost_x_u),
            lnfreight_x_bx:   num(b.freight_x_bx),
            lnduties_x_bx:    num(b.duties_x_bx),
            lnbroker_x_bx:    num(b.broker_x_bx),
            lnhandling_x_bx:  num(b.handling_x_bx),
            lnocharges_x_bx:  num(b.ocharges_x_bx),
            llconfir_box:     bit(b.confir_box),
            llsold_boxes:     bit(b.sold_boxes),
            lcremarks:        str(b.remarks,      200),
            lccust_prod_code:  str(b.cust_product_code, 30),
            lcuser_uq:        str(b.user_uq, 8),
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
        const r = await executeProcedure("sp_flower_packing_box_delete", {
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
