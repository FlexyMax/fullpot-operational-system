import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/inventory-entry/warehouse?pk_box_uq=X
// Returns stock, adjusts, and invoices for the selected box
export async function GET(req: NextRequest) {
    const pk_box_uq = req.nextUrl.searchParams.get("pk_box_uq") || "";
    try {
        const [stock, adjusts, invoices] = await Promise.all([
            executeProcedure("sp_flower_packing_stock_by_packing_box", { lcunico: pk_box_uq }),
            executeProcedure("sp_flower_packing_stock_adjusts",         { lcunico: pk_box_uq }),
            executeProcedure("sp_flower_packing_box_in_invoice_box",    { lcunico: pk_box_uq }),
        ]);
        return NextResponse.json({
            stock:    stock.recordset    ?? [],
            adjusts:  adjusts.recordset  ?? [],
            invoices: invoices.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
