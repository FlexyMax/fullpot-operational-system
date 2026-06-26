import { NextRequest, NextResponse } from "next/server";
import { getFullpotPool } from "@/lib/db";

type P = { params: Promise<{ unico: string }> };

// GET /api/inventory-entry/boxes/[unico]/scan-history
// VFP's "Scan History" button calls a stored procedure that no longer exists on the live
// database (sp_flower_packing_box_scan_history) — confirmed missing via sys.procedures.
// The underlying data is real, though: flower_packing_box_control holds one row per scan
// event (qty_in/qty_out at warehouse check-in/check-out), so we query it directly.
export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const pool = await getFullpotPool();
        const r = await pool.request().input("unico", unico).query(`
            SELECT box_no, qty_in, qty_out, qty_total, barcode, rack, [timestamp], physical_count
            FROM flower_packing_box_control
            WHERE pk_box_uq = @unico
            ORDER BY [timestamp] DESC
        `);
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
