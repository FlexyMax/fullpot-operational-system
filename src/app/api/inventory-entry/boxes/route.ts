import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const bit = (v: any) => (v ? 1 : 0);

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_insert", {
            lcpack_uq:         str(b.pack_uq, 8),
            lccustomer_uq:     str(b.customer_uq, 8),
            lncustomer:        bit(b.customer_uq),
            lccporder_no:      str(b.cporder_no, 10),
            lcproduct_uq:      str(b.product_uq, 8),
            lccase_uq:         str(b.case_uq, 8),
            lncut:             int(b.cut_point ?? 2),
            lnbox_qty:         int(b.box_qty),
            lnpacks_box:       int(b.packs_box),
            lnpacks_units:     int(b.packs_units),
            lnunits_x_box:     int(b.units_x_box),
            lnfreight_cost:    num(b.freight_cost),
            lnhandling_cost:   num(b.handling_cost),
            lnduties_cost:     num(b.duties_cost),
            lnbroker_cost:     num(b.broker_cost),
            lncharge_cost:     num(b.charge_cost),
            f_cost_x_u:        num(b.f_cost_x_u),
            lnprice_x_u:       num(b.price_x_u),
            lcbox_id:          str(b.box_id, 20),
            lcinventory_notes: str(b.inventory_notes, 250),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? row?.UNICO });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
