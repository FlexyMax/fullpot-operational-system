import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower_uq   = req.nextUrl.searchParams.get("grower_uq")   ?? "";
    const date_from   = req.nextUrl.searchParams.get("date_from")   ?? new Date("2000-01-01").toISOString();
    const date_to     = req.nextUrl.searchParams.get("date_to")     ?? new Date().toISOString();
    try {
        const r = await executeProcedure("sp_flower_growers_pending_invoices_report", {
            lcgrower_uq:  grower_uq,
            lddate_from:  date_from,
            lddate_to:    date_to,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
