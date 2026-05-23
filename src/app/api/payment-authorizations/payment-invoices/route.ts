import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const payment_uq = req.nextUrl.searchParams.get("payment_uq") ?? "";
    if (!payment_uq) return NextResponse.json({ error: "payment_uq required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_growers_payments_invoices", {
            lcpayment_uq: payment_uq,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
