import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");

export async function POST(req: NextRequest) {
    const { wphysical_uq, season_uq_from, season_uq_to } = await req.json();
    try {
        // Note: SP params are @lcwphysical_uq, @lcnew_season_uq, @lcsource_season_uq
        // season_uq_to = new season (destination), season_uq_from = source
        const r = await executeProcedure("sp_flower_warehouses_physical_freights_copy", {
            lcwphysical_uq:   txt(wphysical_uq),
            lcnew_season_uq:  txt(season_uq_to),
            lcsource_season_uq: txt(season_uq_from),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Freights copied." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
