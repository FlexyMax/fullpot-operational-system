import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, parseInt(searchParams.get("page")     || "1"));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "50"));
    const search   = searchParams.get("search") || "";
    try {
        // sp_NC_products_list_to_update_stocks (renamed + paginated version of sp_flower_products_list_to_update_stocks)
        const r = await executeProcedure("sp_NC_products_list_to_update_stocks", {
            lnPageNumber:  page,
            lnRowsOfPage:  pageSize,
            lcdescription: search,
        });
        const records = r.recordset;
        const total   = records[0]?.QueryTotalRecords ?? 0;
        return NextResponse.json({ records, total, page, pageSize });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
