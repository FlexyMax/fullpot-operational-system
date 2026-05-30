import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const mode = req.nextUrl.searchParams.get("mode") || "delivery";
    const date = req.nextUrl.searchParams.get("date");
    if (!date) return NextResponse.json([]);
    try {
        const d = new Date(date);
        let r;
        if (mode === "shipping") {
            r = await executeProcedure("sp_flower_prebook_customers_by_shipping_date_closed", { ldwhouse_date: d });
        } else {
            r = await executeProcedure("sp_flower_prebook_customers_by_date_closed", { ldpb_date: d });
        }
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
