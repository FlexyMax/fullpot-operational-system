import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, getFullpotPool } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";

type P = { params: Promise<{ unico: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const bit = (v: any) => (v ? 1 : 0);

// Fields the box detail SP doesn't select but the edit form needs
async function getExtraFields(unico: string) {
    const pool = await getFullpotPool();
    const r = await pool.request().input("unico", unico)
        .query(`SELECT cporder_no, cut_point, inventory_notes FROM flower_packing_box WHERE unico = @unico`);
    return r.recordset?.[0] ?? {};
}

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const [r, extra] = await Promise.all([
            executeProcedure("sp_flower_packing_box_uq", { lcunico: unico }),
            getExtraFields(unico),
        ]);
        const row = r.recordset[0];
        return NextResponse.json(row ? { ...row, ...extra } : null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_update_new", {
            lcunico:           unico,
            lccustomer_uq:     str(b.customer_uq, 8),
            lncustomer:        bit(b.customer_uq),
            lccporder_no:      str(b.cporder_no, 10),
            lcproduct_uq:      str(b.product_uq, 8),
            lccase_uq:         str(b.case_uq, 8),
            lncut:             int(b.cut_point),
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
        serverAuditLog(PANTA, "Edit", "flower_packing_box", unico).catch(() => {});
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
        serverAuditLog(PANTA, "Delete", "flower_packing_box", unico).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
