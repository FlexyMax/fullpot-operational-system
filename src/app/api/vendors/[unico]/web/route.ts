import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";
type P = { params: Promise<{ unico: string }> };

const bit = (v: any) => (v ? 1 : 0);

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_growers_update_web", {
            lcunico:                   unico,
            lcpassword:                String(b.clave ?? b.password ?? "").substring(0, 8),
            llchange_password:         bit(b.change_password),
            llinventory_from_products: bit(b.inventory_from_products),
            llweb_confirm_boxes:       bit(b.web_confirm_boxes),
            llweb_confirm_stems:       bit(b.web_confirm_stems),
            llweb_packing:             bit(b.web_packing),
            llweb_credits:             bit(b.web_credits),
            llweb_demand:              bit(b.web_demand),
            llweb_consignations:       bit(b.web_consignations),
            ldcot_farm:                b.cot_farm ? new Date(b.cot_farm) : null,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        serverAuditLog(PANTA, "Edit", "flower_growers", unico).catch(() => {});
        return NextResponse.json({ success: true, message: row?.message || "Web settings updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
