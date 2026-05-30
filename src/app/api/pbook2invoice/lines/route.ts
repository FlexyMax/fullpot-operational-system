import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const date        = req.nextUrl.searchParams.get("date");
    const customer_uq = req.nextUrl.searchParams.get("customer_uq") || "%";
    const mode        = req.nextUrl.searchParams.get("mode") || "delivery";
    const product     = req.nextUrl.searchParams.get("product") || "%";
    if (!date) return NextResponse.json([]);
    try {
        const r = await executeProcedure("sp_flower_prebook_box_to_invoice_box", {
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
