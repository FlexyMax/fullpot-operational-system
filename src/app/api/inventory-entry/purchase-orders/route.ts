import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/inventory-entry/purchase-orders?ship_date=X&grower_uq=Y
export async function GET(req: NextRequest) {
    const ship_date  = req.nextUrl.searchParams.get("ship_date");
    const grower_uq  = req.nextUrl.searchParams.get("grower_uq") || "";
    const dateVal = new Date(ship_date || new Date().toISOString().split("T")[0]);
    try {
        if (grower_uq === "ALL") {
            // Pass "%" — sp_NC_porders_by_grower uses LIKE so % returns all growers in one call
            const r = await executeProcedure("sp_NC_porders_by_grower", { grower_uq: "%", date: dateVal });
            return NextResponse.json({ byGrower: r.recordset ?? [], summary: [] });
        }
        if (grower_uq) {
            const r = await executeProcedure("sp_NC_porders_by_grower", { grower_uq, date: dateVal });
            return NextResponse.json({ byGrower: r.recordset ?? [], summary: [] });
        }
        const r = await executeProcedure("sp_flower_prebook_box_porder_dates_growers", {
            ldship_date: dateVal,
        });
        return NextResponse.json({ summary: r.recordset ?? [], byGrower: [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
