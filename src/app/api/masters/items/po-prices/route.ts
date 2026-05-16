import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const { city_uq, season_uq, product_uq, price } = await req.json();
    if (!city_uq || !season_uq || !product_uq) return NextResponse.json({ success: false, error: "City, season and product are required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_products_seasons_insert", {
            lccity_uq:   city_uq,
            lcseason_uq: season_uq,
            lcproduct_uq: product_uq,
            lnprice:     price || 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
