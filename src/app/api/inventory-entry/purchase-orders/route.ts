import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/inventory-entry/purchase-orders?ship_date=X&grower_uq=Y
export async function GET(req: NextRequest) {
    const ship_date  = req.nextUrl.searchParams.get("ship_date");
    const grower_uq  = req.nextUrl.searchParams.get("grower_uq") || "";
    const dateVal = new Date(ship_date || new Date().toISOString().split("T")[0]);
    try {
        if (grower_uq === "ALL") {
            const summaryR = await executeProcedure("sp_flower_prebook_box_porder_dates_growers", { ldship_date: dateVal });
            const growers  = (summaryR.recordset ?? []).filter((g: any) => {
                const uq = g.GROWER_UQ ?? g.GRO_UQ ?? g.VENDOR_UQ ?? g.GROW_UQ ?? "";
                return uq && String(uq).trim();
            });
            const chunks = await Promise.all(
                growers.map((g: any) => {
                    const uq = g.GROWER_UQ ?? g.GRO_UQ ?? g.VENDOR_UQ ?? g.GROW_UQ ?? "";
                    return executeProcedure("sp_flower_porders_by_grower", { grower_uq: uq, date: dateVal })
                        .then((r: any) => r.recordset ?? []);
                })
            );
            return NextResponse.json({ byGrower: chunks.flat(), summary: [] });
        }
        if (grower_uq) {
            const r = await executeProcedure("sp_flower_porders_by_grower", {
                grower_uq: grower_uq,
                date:      dateVal,
            });
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
