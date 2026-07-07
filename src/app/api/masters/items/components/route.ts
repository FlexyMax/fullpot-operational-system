import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lcsearch = searchParams.get("search") || "%";
    const page     = Math.max(1, parseInt(searchParams.get("page") || "1"));
    try {
        const r = await executeProcedure("sp_NC_varieties_search", {
            lnPageNumber: page,
            lnRowsOfPage: 200,
            lcsearch,
        });
        const records = r.recordset ?? [];
        const total   = records[0]?.QueryTotalRecords ?? records.length;
        return NextResponse.json({ records, total, page, pageSize: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
