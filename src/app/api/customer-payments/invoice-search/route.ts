import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q") || "";
    if (!q.trim()) return NextResponse.json({ success: false, error: "Search criteria is empty." }, { status: 400 });
    const invoiceNo = parseInt(q);
    if (isNaN(invoiceNo)) return NextResponse.json({ success: false, error: "Invoice number must be numeric." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_accounts_rec_invoice_search", {
            lninvoice_no: invoiceNo,
        });
        if (!r.recordset.length) return NextResponse.json({ found: false, message: "Invoice number not found." });
        const inv = r.recordset[0];
        if (inv.void) return NextResponse.json({ found: true, voided: true, message: "Invoice was voided.", invoice: inv });
        return NextResponse.json({ found: true, voided: false, invoice: inv });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
