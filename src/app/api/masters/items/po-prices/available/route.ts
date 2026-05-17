import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const city_uq  = searchParams.get("city_uq")   || "%";
    const season_uq= searchParams.get("season_uq") || "%";
    const search   = searchParams.get("search")    || "%";
    const page     = Math.max(1, parseInt(searchParams.get("page")     || "1"));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "50"));
    try {
        const r = await executeProcedure("sp_flower_products_seasons_not_in", {
            lccity_uq:    city_uq,
            lcseason_uq:  season_uq,
            lcproduct:    search,
            lnPageNumber: page,
            lnRowsOfPage: pageSize,
        });
        const records = r.recordset;
        const total   = records[0]?.QueryTotalRecords ?? 0;
        return NextResponse.json({ records, total, page, pageSize });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
