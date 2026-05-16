import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const { product_uq, recipe_uq } = await req.json();
    if (!product_uq || !recipe_uq) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_products_alternative_recipes_insert", {
            lcproduct_uq: product_uq,
            lcalt_product_uq: recipe_uq,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
