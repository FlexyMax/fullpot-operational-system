import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ customer_uq: string }> };

export async function GET(req: NextRequest, { params }: P) {
    const { customer_uq } = await params;
    const from = req.nextUrl.searchParams.get("from") || new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
    const to   = req.nextUrl.searchParams.get("to")   || new Date().toISOString().split("T")[0];
    try {
        // SP param is @Customer (verified 2026-05-18)
        const r = await executeProcedure("sp_flower_accounts_rec_statment", {
            Customer:       customer_uq,
            ldStart_date:   from,
            ldEnd_date:     to,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
