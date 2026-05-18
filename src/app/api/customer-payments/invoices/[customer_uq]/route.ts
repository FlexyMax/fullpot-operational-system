import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ customer_uq: string }> };

export async function GET(req: NextRequest, { params }: P) {
    const { customer_uq } = await params;
    const balance = req.nextUrl.searchParams.get("balance") !== "false"; // default true
    try {
        const r = await executeProcedure("sp_flower_customer_invoices", {
            lcCustomer_uq: customer_uq,
            balance:       balance ? 1 : 0,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
