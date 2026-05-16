import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const product_uq = searchParams.get("product_uq") || "%";
    try {
        const r = await executeProcedure("sp_flower_products_quotas_growers_list", {
            lcproduct_uq:   product_uq,
            lcsalesman_uq:  "%",
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
