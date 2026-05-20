import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// sp_flower_packing_box_update_new params (verified):
// @lcunico, @lccustomer_uq, @lncustomer, @lccporder_no, @lcproduct_uq,
// @lccase_uq, @lncut, @lnbox_qty, @lnpacks_box, @lnpacks_units,
// @lnunits_x_box, @lnfreight_cost, @lnhandling_cost, @lnduties_cost,
// @lnbroker_cost, @lncharge_cost, @f_cost_x_u, @lnprice_x_u,
// @lcbox_id, @lcinventory_notes

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_update_new", {
            lcunico:           unico,
            lccustomer_uq:     b.customer_uq     ?? "",
            lncustomer:        parseInt(b.customer_num) || 0,
            lccporder_no:      b.cporder_no      ?? "",
            lcproduct_uq:      b.product_uq      ?? "",
            lccase_uq:         b.case_uq         ?? "",
            lncut:             parseInt(b.cut)   || 0,
            lnbox_qty:         parseInt(b.box_qty)         || 0,
            lnpacks_box:       parseInt(b.packs_box)       || 0,
            lnpacks_units:     parseInt(b.packs_units)     || 0,
            lnunits_x_box:     parseInt(b.units_x_box)     || 0,
            lnfreight_cost:    parseFloat(b.freight_cost)  || 0,
            lnhandling_cost:   parseFloat(b.handling_cost) || 0,
            lnduties_cost:     parseFloat(b.duties_cost)   || 0,
            lnbroker_cost:     parseFloat(b.broker_cost)   || 0,
            lncharge_cost:     parseFloat(b.charge_cost)   || 0,
            f_cost_x_u:        parseFloat(b.f_cost_x_u)   || 0,
            lnprice_x_u:       parseFloat(b.price_x_u)    || 0,
            lcbox_id:          b.box_id          ?? "",
            lcinventory_notes: b.inventory_notes ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
