import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const today = new Date().toISOString().split("T")[0];
        const r = await executeProcedure("sp_flower_invoice_credits_request_by_date", {
            approved: 0,
            denied:   0,
            Date:     today,
        });
        return NextResponse.json({ count: r.recordset.length, records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
