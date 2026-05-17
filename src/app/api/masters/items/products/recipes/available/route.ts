import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const product_uq  = searchParams.get("product_uq") || "";
    const description = searchParams.get("search")     || "%";
    const page        = Math.max(1, parseInt(searchParams.get("page")     || "1"));
    const pageSize    = Math.max(1, parseInt(searchParams.get("pageSize") || "50"));
    try {
        const r = await executeProcedure("sp_flower_products_alternative_recipes_not_in", {
            lcproduct_uq:  product_uq,
            lcdescription: description,
            lnPageNumber:  page,
            lnRowsOfPage:  pageSize,
        });
        const records = r.recordset;
        const total   = records[0]?.QueryTotalRecords ?? 0;
        return NextResponse.json({ records, total, page, pageSize });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
