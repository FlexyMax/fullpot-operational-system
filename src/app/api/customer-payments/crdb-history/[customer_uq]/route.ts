import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ customer_uq: string }> };

export async function GET(req: NextRequest, { params }: P) {
    const { customer_uq } = await params;
    const date = req.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];
    try {
        const r = await executeProcedure("sp_flower_accounts_rec_credits_dates_history", {
            lccustomer_uq: customer_uq,
            ldcrdb_date:   date,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
