import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const PAGE_SIZE_DEFAULT = 50;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, parseInt(searchParams.get("page")     || "1"));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || String(PAGE_SIZE_DEFAULT)));
    const search   = searchParams.get("search") || "";
    try {
        const r = await executeProcedure("sp_NC_products_general_list", {
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
