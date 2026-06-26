import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/inventory-entry/warehouse?pk_box_uq=X
// Returns stock, adjusts, and invoices for the selected box
export async function GET(req: NextRequest) {
    const pk_box_uq = req.nextUrl.searchParams.get("pk_box_uq") || "";
    try {
        const [stock, invoices] = await Promise.all([
            executeProcedure("sp_flower_packing_stock_by_packing_box", { lcpkbox_uq: pk_box_uq }),
            executeProcedure("sp_flower_packing_box_in_invoice_box",   { lcpkbox_uq: pk_box_uq }),
        ]);
        const stockRows = stock.recordset ?? [];
        // sp_flower_packing_stock_adjusts is scoped per warehouse-stock placement (lcpkstock_uq),
        // not per box — fan out across every stock row this box currently has.
        const adjustsLists = await Promise.all(
            stockRows.map((s: any) => executeProcedure("sp_flower_packing_stock_adjusts", { lcpkstock_uq: s.unico }))
        );
        const adjusts = adjustsLists.flatMap(r => r.recordset ?? []);
        return NextResponse.json({
            stock:    stockRows,
            adjusts,
            invoices: invoices.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
