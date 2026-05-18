import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ customer_uq: string }> };

export async function GET(_req: Request, { params }: P) {
    const { customer_uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_accounts_rec_credits_dates", {
            lccustomer_uq: customer_uq,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
