import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ income_uq: string }> };

export async function GET(_req: Request, { params }: P) {
    const { income_uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_customers_incomes_invoices", {
            lcincome_uq: income_uq,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
