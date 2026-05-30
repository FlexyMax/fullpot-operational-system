import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const [
            detail,
            invoiced,
            purchase,
            stockAssigned,
            stockSimilar,
        ] = await Promise.all([
            executeProcedure("sp_flower_prebook_box_uq_pc", { lcpbook_box_uq: unico }),
            executeProcedure("sp_flower_prebook_box_in_invoice_box", { lcpbook_box_uq: unico }),
            executeProcedure("sp_flower_prebook_box_purchase", { lcprebook_d_uq: unico }),
            executeProcedure("sp_flower_packing_stock_preassigned", { lcpbook_box_uq: unico }),
            executeProcedure("sp_flower_packing_stock_similar_products", { lcpbook_d_uq: unico }),
        ]);
        return NextResponse.json({
            detail:       detail.recordset?.[0] ?? null,
            invoiced:     invoiced.recordset ?? [],
            purchase:     purchase.recordset ?? [],
            stockAssigned: stockAssigned.recordset ?? [],
            stockSimilar:  stockSimilar.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
