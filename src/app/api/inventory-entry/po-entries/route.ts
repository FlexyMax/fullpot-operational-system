import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };

// POST /api/inventory-entry/po-entries
// Body: { porder_uq, packing_uq, qty_ship, user_uq }
export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_inventory_insert_from_porder", {
            lcporder_uq:   str(b.porder_uq,  8),
            lcPacking_uq:  str(b.packing_uq, 8),
            qty_ship:      int(b.qty_ship),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Insert", "flower_packing_box", str(b.packing_uq, 8), "PO Entry").catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
