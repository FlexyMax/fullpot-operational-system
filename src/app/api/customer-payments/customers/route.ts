import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
    const search  = req.nextUrl.searchParams.get("search")  || "";
    const balance = req.nextUrl.searchParams.get("balance") || "A"; // A=All, B=>0, N==0
    const page    = Math.max(1, parseInt(req.nextUrl.searchParams.get("page")     || "1"));
    const pageSize= Math.max(1, parseInt(req.nextUrl.searchParams.get("pageSize") || String(PAGE_SIZE)));
    try {
        // sp_NC_customers_list_for_statement — paginated + balance filter (verified 2026-05-19)
        // @lnBalance: 'A'=All, 'B'=Bal>0, 'N'=Bal=0
        // Returns money fields pre-formatted as '$1,234.56' strings; total_books_bal is raw numeric
        const r = await executeProcedure("sp_NC_customers_list_for_statement", {
            lnPageNumber:    page,
            lnRowsOfPage:    pageSize,
            lccustomer_name: search,
            lnBalance:       balance,
        });
        const records = r.recordset;
        const total   = records[0]?.QueryTotalRecords ?? 0;
        return NextResponse.json({ records, total, page, pageSize });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
