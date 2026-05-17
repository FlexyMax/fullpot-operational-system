import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search   = searchParams.get("search")   || "";
    const page     = Math.max(1, parseInt(searchParams.get("page")     || "1"));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "50"));
    try {
        const r = await executeProcedure("sp_flower_customers_list_with_all", {
            llall:        1,
            lcsearch:     search,
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
