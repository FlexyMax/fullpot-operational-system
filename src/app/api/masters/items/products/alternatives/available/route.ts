import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const product_uq  = searchParams.get("product_uq") || "";
    const description = searchParams.get("search") || "%";
    try {
        const r = await executeProcedure("sp_flower_products_alternative_not_in", {
            lcproduct_uq: product_uq,
            lcdescription: description,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
