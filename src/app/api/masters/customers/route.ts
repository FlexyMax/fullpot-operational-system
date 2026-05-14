import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "%";
    const page   = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const param  = search === "%" ? "%" : (search.includes("%") ? search : `%${search}%`);
    try {
        const result = await executeProcedure("sp_NC_customers_list_for_salesmen", {
            lnPageNumber: page,
            lnRowsOfPage: PAGE_SIZE,
            lccustomer:   param,
        });
        const totalRecords = result.recordset[0]?.QueryTotalRecords ?? 0;
        return NextResponse.json({
            customers:    result.recordset,
            page,
            totalRecords,
            hasMore:      result.recordset.length === PAGE_SIZE && page * PAGE_SIZE < totalRecords,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
