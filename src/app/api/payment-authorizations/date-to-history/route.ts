import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// POST { date_from, date_to, balance: "zero" | "nonzero" | "all" }
// Moves payments with invoice dates in range to history.
// VFP: ventas_growers_payments_date_to_history.prg
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { date_from, date_to, balance } = body;
    if (!date_from || !date_to) return NextResponse.json({ success: false, error: "date_from and date_to required" }, { status: 400 });

    // balance maps: "zero" → 0, "nonzero" → 1, "all" → 2
    const balanceCode = balance === "zero" ? 0 : balance === "nonzero" ? 1 : 2;

    try {
        const r = await executeProcedure("sp_flower_growers_payments_date_to_history", {
            lddate_from: new Date(date_from),
            lddate_to:   new Date(date_to),
            lnbalance:   balanceCode,
        });
        const result = r.recordset?.[0];
        if (result?.OK === 0 || result?.success === false) {
            return NextResponse.json({ success: false, error: result?.MESSAGE ?? result?.error ?? "Operation failed" });
        }
        return NextResponse.json({ success: true, data: result ?? null });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
