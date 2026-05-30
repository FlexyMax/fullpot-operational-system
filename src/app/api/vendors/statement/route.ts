import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower_uq = req.nextUrl.searchParams.get("grower_uq") || "";
    const date_to   = req.nextUrl.searchParams.get("date_to");
    const asOf = new Date(date_to || new Date().toISOString().split("T")[0]);
    try {
        const r = await executeProcedure("sp_flower_growers_pending_invoices_to_growers", {
            lcgrower_uq: grower_uq,
            lddate_from: asOf,
        });
        const rows = r.recordset ?? [];
        return NextResponse.json({
            statement: rows,
            pending:   rows,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
