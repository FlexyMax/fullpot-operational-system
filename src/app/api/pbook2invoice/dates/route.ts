import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const [delivery, shipping] = await Promise.all([
            executeProcedure("sp_flower_prebook_to_invoice_dates", {}),
            executeProcedure("sp_flower_prebook_to_invoice_dates_shipping", {}),
        ]);
        return NextResponse.json({
            delivery: delivery.recordset ?? [],
            shipping: shipping.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
