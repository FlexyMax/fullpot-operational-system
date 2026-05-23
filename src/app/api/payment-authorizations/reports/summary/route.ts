import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower_uq = req.nextUrl.searchParams.get("grower_uq") ?? "";
    const ldfrom    = req.nextUrl.searchParams.get("ldfrom")    ?? new Date("2000-01-01").toISOString();
    const ldto      = req.nextUrl.searchParams.get("ldto")      ?? new Date().toISOString();
    const lnoption  = parseInt(req.nextUrl.searchParams.get("lnoption") ?? "1", 10);
    try {
        const r = await executeProcedure("sp_flower_growers_pending_invoices_report2", {
            lcgrower_uq: grower_uq,
            ldfrom,
            ldto,
            lnoption,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
