import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ invoice_no: string }> };

export async function GET(_req: Request, { params }: P) {
    const { invoice_no } = await params;
    const num = parseInt(invoice_no);
    if (isNaN(num)) return NextResponse.json({ found: false, message: "Invoice number must be numeric." });
    try {
        // SP param is @Invoice int (note: typo "searh" in SP name — verified)
        const r = await executeProcedure("sp_flower_searh_account_rec", { Invoice: num });
        if (!r.recordset.length) return NextResponse.json({ found: false, message: "Invoice not found." });
        return NextResponse.json({ found: true, invoice: r.recordset[0] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
