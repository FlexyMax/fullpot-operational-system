import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";

type P = { params: Promise<{ unico: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_packing_box_composition", { lcpkbox_uq: unico });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_composition_insert", {
            lcpkbox_uq:       unico,
            lcproduct_uq:     str(b.product_uq, 8),
            lnbunches_x_case: int(b.bunches_x_case),
            lnunits_x_bunch:  int(b.units_x_bunch),
            lngrow_price:     num(b.grow_price),
            lnsalesprice:     num(b.salesprice),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        const newUnico = row?.unico ?? row?.UNICO ?? null;
        serverAuditLog(PANTA, "Insert", "flower_packing_box_bunches_composition", newUnico ?? unico).catch(() => {});
        return NextResponse.json({ success: true, unico: newUnico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
