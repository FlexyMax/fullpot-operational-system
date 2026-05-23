import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const outcome_uq = req.nextUrl.searchParams.get("outcome_uq") ?? "";
    if (!outcome_uq) return NextResponse.json({ error: "outcome_uq required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_growers_payments_report", {
            lcoutcome_uq: outcome_uq,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
