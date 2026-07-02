import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";

type P = { params: Promise<{ unico: string; composition_uq: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico, composition_uq } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_composition_update", {
            lcunico:          composition_uq,
            lcpkbox_uq:       unico,
            lcproduct_uq:     str(b.product_uq, 8),
            lnbunches_x_case: int(b.bunches_x_case),
            lnunits_x_bunch:  int(b.units_x_bunch),
            lngrow_price:     num(b.grow_price),
            lnsalesprice:     num(b.salesprice),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Edit", "flower_packing_box_bunches_composition", composition_uq).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { composition_uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_packing_box_composition_delete", {
            lccomposition_uq: composition_uq,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Delete", "flower_packing_box_bunches_composition", composition_uq).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
