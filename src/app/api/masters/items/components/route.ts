import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const raw      = searchParams.get("search")   || "%";
    // SP prepends '%' to the search term → to match anywhere (not just suffix), append '%' before sending
    const lcsearch = raw === "%" ? "%" : raw.endsWith("%") ? raw : `${raw}%`;
    const page     = Math.max(1, parseInt(searchParams.get("page")     || "1"));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "50"));
    try {
        const r = await executeProcedure("sp_flower_varieties_search", { lcsearch });
        const records = r.recordset ?? [];
        const total   = records[0]?.QueryTotalRecords ?? records.length;
        return NextResponse.json({ records, total, page: 1, pageSize: records.length });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
