import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        // sp_NC_prebook_to_invoice_dates: web-app-only replacement for the legacy
        // sp_flower_prebook_to_invoice_dates(_shipping) pair (still used by VFP,
        // left untouched) — same result, ~7x faster. See sql/pbook2invoice/.
        const [delivery, shipping] = await Promise.all([
            executeProcedure("sp_NC_prebook_to_invoice_dates", { llpb_date: 1 }),
            executeProcedure("sp_NC_prebook_to_invoice_dates", { llpb_date: 0 }),
        ]);
        return NextResponse.json({
            delivery: delivery.recordset ?? [],
            shipping: shipping.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
