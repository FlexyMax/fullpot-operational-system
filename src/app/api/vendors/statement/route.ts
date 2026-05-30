import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower_uq = req.nextUrl.searchParams.get("grower_uq") || "";
    const date_from = req.nextUrl.searchParams.get("date_from");
    const date_to   = req.nextUrl.searchParams.get("date_to");
    try {
        const [r1, r2] = await Promise.all([
            executeProcedure("sp_flower_accounts_rec_statment_balance", {
                Customer: grower_uq,
                ldfrom:   new Date(date_from || "2000-01-01"),
                ldto:     new Date(date_to || new Date().toISOString().split("T")[0]),
            }),
            executeProcedure("sp_flower_growers_pending_invoices_to_growers", {
                lcgrower_uq: grower_uq,
                lddate_from: new Date(date_to || new Date().toISOString().split("T")[0]),
            }),
        ]);
        return NextResponse.json({
            statement: r1.recordset ?? [],
            pending:   r2.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
