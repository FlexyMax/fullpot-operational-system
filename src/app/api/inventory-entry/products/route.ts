import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/inventory-entry/products?page=1&pageSize=50&search=roses
export async function GET(req: NextRequest) {
    const page     = parseInt(req.nextUrl.searchParams.get("page")     || "1",  10);
    const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") || "50", 10);
    const search   = req.nextUrl.searchParams.get("search") || "";
    try {
        const r = await executeProcedure("sp_NC_prebook_products_list", {
            pageNo:   page,
            pageSize: pageSize,
            lcSearch: search,
        });
        const rows  = r.recordset ?? [];
        const total = rows.length > 0 ? Number(rows[0].TOTAL_RECORDS ?? rows[0].TOTAL ?? rows.length) : 0;
        return NextResponse.json({ rows, total, page, pageSize });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
