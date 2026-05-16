import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const { minimo, maximo, upc, proyection_upc, sales_price } = await req.json();
    try {
        const r = await executeProcedure("sp_flower_products_update_stocks", {
            lcproduct_uq:     unico,
            lnminimo:         minimo         ?? 0,
            lnmaximo:         maximo         ?? 0,
            lcupc:            upc            ?? "",
            lcproyection_upc: proyection_upc ?? "",
            lnsales_price:    sales_price    ?? 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
