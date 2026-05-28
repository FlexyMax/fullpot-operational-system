import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/inventory-entry/purchase-orders?ship_date=X&grower_uq=Y
export async function GET(req: NextRequest) {
    const ship_date  = req.nextUrl.searchParams.get("ship_date");
    const grower_uq  = req.nextUrl.searchParams.get("grower_uq") || "";
    try {
        if (grower_uq) {
            const r = await executeProcedure("sp_flower_porders_by_grower", {
                grower_uq: grower_uq,
                date:      new Date(ship_date || new Date().toISOString().split("T")[0]),
            });
            return NextResponse.json({ byGrower: r.recordset ?? [], summary: [] });
        }
        const r = await executeProcedure("sp_flower_prebook_box_porder_dates_growers", {
            ldship_date: new Date(ship_date || new Date().toISOString().split("T")[0]),
        });
        return NextResponse.json({ summary: r.recordset ?? [], byGrower: [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
