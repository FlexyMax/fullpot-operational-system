import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower_uq     = req.nextUrl.searchParams.get("grower_uq")     ?? "";
    const payments_from = req.nextUrl.searchParams.get("payments_from") ?? new Date("2000-01-01").toISOString();
    const payments_to   = req.nextUrl.searchParams.get("payments_to")   ?? new Date().toISOString();
    try {
        const r = await executeProcedure("sp_flower_growers_payments_by_dates_resume_report", {
            lcgrower_uq:     grower_uq,
            ldpayments_from: payments_from,
            ldpayments_to:   payments_to,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
