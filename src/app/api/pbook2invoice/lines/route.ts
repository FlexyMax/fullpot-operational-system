import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const date        = req.nextUrl.searchParams.get("date");
    const customer_uq = req.nextUrl.searchParams.get("customer_uq") || "%";
    const mode        = req.nextUrl.searchParams.get("mode") || "delivery";
    const product     = req.nextUrl.searchParams.get("product") || "%";
    if (!date) return NextResponse.json([]);
    try {
        // sp_NC_prebook_box_to_invoice_box: web-app-only replacement for the
        // legacy sp_flower_prebook_box_to_invoice_box (still used by VFP, left
        // untouched) — same result, ~12-14x faster, and fixes a real bug in the
        // legacy proc's shipping/arrival branch (it showed the prebook's
        // header-level invoice number for every box, which is wrong once a
        // prebook's boxes get split across more than one invoice via Partial
        // Invoice — this version attributes invoice_no per box, like the
        // legacy delivery branch already did correctly). See sql/pbook2invoice/.
        const r = await executeProcedure("sp_NC_prebook_box_to_invoice_box", {
            ldpb_date:     new Date(date),
            lccustomer_uq: customer_uq,
            llpb_date:     mode === "delivery" ? 1 : 0,
            lcproduct:     product || "%",
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
