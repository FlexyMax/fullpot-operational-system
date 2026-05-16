import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const { price } = await req.json();
    try {
        // @lccustomer_product_uq = the unico of the flower_products_seasons record
        const r = await executeProcedure("sp_flower_products_seasons_update", {
            lccustomer_product_uq: unico,
            lnprice:               price ?? 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_products_seasons_delete", { lcunico: unico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
