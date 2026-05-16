import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const city_uq   = searchParams.get("city_uq")   || "%";
    const season_uq = searchParams.get("season_uq") || "%";
    const search    = searchParams.get("search")     || "%";
    try {
        const r = await executeProcedure("sp_flower_products_seasons_in", {
            lccity_uq:   city_uq,
            lcseason_uq: season_uq,
            lcproduct:   search,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
