import { NextRequest, NextResponse } from "next/server";

// POST { date_from, date_to, balance: "zero" | "nonzero" | "all" }
// Moves payments with invoice dates in range to history.
// VFP: ventas_growers_payments_date_to_history.prg
// NOTE: SP sp_flower_growers_payments_date_to_history not yet deployed — returns 501 until configured.
export async function POST(_req: NextRequest) {
    return NextResponse.json(
        { success: false, error: "Move to History is not yet configured in this environment. Please contact the administrator." },
        { status: 501 }
    );
}
