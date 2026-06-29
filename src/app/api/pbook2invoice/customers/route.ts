import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const mode = req.nextUrl.searchParams.get("mode") || "delivery";
    const date = req.nextUrl.searchParams.get("date");
    if (!date) return NextResponse.json([]);
    try {
        // sp_NC_prebook_customers_by_date_closed: web-app-only replacement for the
        // legacy sp_flower_prebook_customers_by_(shipping_)date_closed pair (still
        // used by VFP, left untouched) — same result, ~10-12x faster. Does not
        // compute the "ALL" totals row the legacy procs UNION ALL on; the page
        // recomputes it client-side by summing these per-customer rows.
        // See sql/pbook2invoice/.
        const r = await executeProcedure("sp_NC_prebook_customers_by_date_closed", {
            lddate: new Date(date),
            llpb_date: mode === "shipping" ? 0 : 1,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
