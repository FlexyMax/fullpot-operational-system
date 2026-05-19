import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ cor_pay_uq: string }> };

export async function GET(_req: Request, { params }: P) {
    const { cor_pay_uq } = await params;
    try {
        // SP param is @lccorporative_uq (verified 2026-05-18)
        const r = await executeProcedure("sp_flower_customers_corporative_incomes_payments_applied", {
            lccorporative_uq: cor_pay_uq,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
