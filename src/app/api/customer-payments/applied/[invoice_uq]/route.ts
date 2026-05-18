import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ invoice_uq: string }> };

export async function GET(_req: Request, { params }: P) {
    const { invoice_uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_accounts_rec_x_income", {
            lcAcc_recd_uq: invoice_uq,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
