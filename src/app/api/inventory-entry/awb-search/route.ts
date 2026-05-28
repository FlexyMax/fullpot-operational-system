import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/inventory-entry/awb-search?page=1&pageSize=50&search=text
// SP params: @lnPageNumber int, @lnRowsOfPage int, @lcSearch varchar(20)
export async function GET(req: NextRequest) {
    const page     = parseInt(req.nextUrl.searchParams.get("page")     || "1",  10);
    const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") || "50", 10);
    const search   = (req.nextUrl.searchParams.get("search") || "").substring(0, 20);
    try {
        const r = await executeProcedure("sp_NC_paking_box_search", {
            lnPageNumber: page,
            lnRowsOfPage: pageSize,
            lcSearch:     search,
        });
        const rows  = r.recordset ?? [];
        const total = rows.length > 0 ? Number(rows[0].TotalLines ?? rows[0].TOTAL_RECORDS ?? rows[0].TOTAL ?? rows.length) : 0;
        return NextResponse.json({ rows, total, page, pageSize });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
