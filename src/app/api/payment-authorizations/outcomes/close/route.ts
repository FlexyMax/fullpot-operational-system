import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// POST { payment_uq }
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { payment_uq } = body;
    if (!payment_uq) return NextResponse.json({ error: "payment_uq required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_accounts_outcome_close", {
            lcpayment_uq: payment_uq,
        });
        return NextResponse.json({ success: true, data: r.recordset[0] ?? null });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
