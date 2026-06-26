import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ unico: string }> };

// PUT /api/inventory-entry/products/[unico]
// Inline-edit fields from the Products List grid's "Change Structure" / "Change to Prices Mode" toggles.
// Each field has its own dedicated stored procedure in the original VFP screen (lost-focus handlers).
const PROC_BY_FIELD: Record<string, { proc: string; param: string }> = {
    up_x_case:   { proc: "sp_flower_products_update_up_x_case",   param: "lnup_x_case" },
    up_x_pack:   { proc: "sp_flower_products_update_up_x_pack",   param: "lnup_x_pack" },
    stem_pack:   { proc: "sp_flower_products_update_stem_pack",   param: "llstem_pack" },
    sales_price: { proc: "sp_flower_products_update_sales_price", param: "lnprice" },
};

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    const entry = PROC_BY_FIELD[b.field];
    if (!entry) return NextResponse.json({ success: false, error: `Unknown field: ${b.field}` }, { status: 400 });
    try {
        const r = await executeProcedure(entry.proc, {
            lcproduct_uq: unico,
            [entry.param]: b.value,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
