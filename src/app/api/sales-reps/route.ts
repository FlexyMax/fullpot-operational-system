import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };

export async function GET(_req: NextRequest) {
    try {
        const r = await executeProcedure("sp_flower_salesman_list", { llactive: 0 });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_salesmen_insert", {
            lcfirst_name:           txt(b.first_name),
            lclast_name:            txt(b.last_name),
            lcaddress:              txt(b.address ?? ""),
            lcphone_1:              txt(b.phone_1 ?? ""),
            lcphone_2:              txt(b.phone_2 ?? ""),
            lcemail_1:              txt(b.email_1 ?? ""),
            lcemail_2:              txt(b.email_2 ?? ""),
            lcold_code:             txt(b.old_code ?? ""),
            llactive:               bit(b.active !== false),
            llremote:               bit(b.remote),
            lcsuperior_uq:          txt(b.superior_uq ?? ""),
            lcuser_uq:              txt(b.user_uq ?? ""),
            lcwphysical_uq:         txt(b.wphysical_uq ?? ""),
            llview_hold:            bit(b.view_hold),
            llview_lot:             bit(b.view_lot),
            llview_grower:          bit(b.view_grower),
            llview_days:            bit(b.view_days),
            llmove_hold:            bit(b.move_hold),
            llview_all_inv:         bit(b.view_all_inv),
            lnpct_sales_commission: num(b.pct_sales_commission ?? 0),
            lncommission_due_days:  num(b.commission_due_days ?? 0),
            lnpct_gp_override:      num(b.pct_gp_override ?? 0),
            llother_1:              bit(b.other_1),
            llother_2:              bit(b.other_2),
            llother_3:              bit(b.other_3),
            llother_4:              bit(b.other_4),
            llother_5:              bit(b.other_5),
            llother_6:              bit(b.other_6),
            llother_7:              bit(b.other_7),
            llother_8:              bit(b.other_8),
            llother_9:              bit(b.other_9),
            llother_10:             bit(b.other_10),
            llother_11:             bit(b.other_11),
            llother_12:             bit(b.other_12),
            llother_13:             bit(b.other_13),
            llother_14:             bit(b.other_14),
            llother_15:             bit(b.other_15),
            llother_16:             bit(b.other_16),
            llother_17:             bit(b.other_17),
            llother_18:             bit(b.other_18),
            llother_19:             bit(b.other_19),
            llother_20:             bit(b.other_20),
            llother_21:             bit(b.other_21),
            llother_22:             bit(b.other_22),
            llother_23:             bit(b.other_23),
            llother_24:             bit(b.other_24),
            llother_25:             bit(b.other_25),
            llother_26:             bit(b.other_26),
            llother_27:             bit(b.other_27),
            llother_28:             bit(b.other_28),
            llother_29:             bit(b.other_29),
            llother_30:             bit(b.other_30),
            llother_31:             bit(b.other_31),
            llother_32:             bit(b.other_32),
            llother_33:             bit(b.other_33),
            llother_34:             bit(b.other_34),
            llother_35:             bit(b.other_35),
            llother_36:             bit(b.other_36),
            llother_37:             bit(b.other_37),
            llother_38:             bit(b.other_38),
            llother_39:             bit(b.other_39),
            llother_40:             bit(b.other_40),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) {
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        }
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.message || row?.Message || "Sales rep created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
