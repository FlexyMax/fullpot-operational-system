import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/pos/invoice/line — add stock line to invoice
// sp_flower_invoice_flexymax_box_insert(@invoice_uq, @pk_sto_uq, @product_uq, @box_qty, @price, @lcuser_uq, @llsold_with_scanner)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const b = await req.json();
        const userId = (session.user as any).id ?? "";
        const r = await executeProcedure("sp_flower_invoice_flexymax_box_insert", {
            invoice_uq:          b.invoice_uq,
            pk_sto_uq:           b.pk_sto_uq,
            product_uq:          b.product_uq ?? "",
            box_qty:             Number(b.box_qty ?? 1),
            price:               Number(b.price ?? 0),
            lcuser_uq:           userId,
            llsold_with_scanner: b.with_scanner ?? false,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.error === true)
            return NextResponse.json({ success: false, error: row.message || row.mensaje || "Failed" }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? null });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
