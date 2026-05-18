import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const { customer_uq, date_from, date_to } = await req.json();
    if (!customer_uq || !date_from || !date_to)
        return NextResponse.json({ success: false, error: "customer_uq, date_from and date_to are required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_customers_pending_invoices_report", {
            lccustomer_uq: customer_uq,
            lddate_from:   date_from,
            lddate_to:     date_to,
        });
        return NextResponse.json({ success: true, records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
