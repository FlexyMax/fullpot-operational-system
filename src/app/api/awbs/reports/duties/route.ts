import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const date_invo = req.nextUrl.searchParams.get("date_invo") || "";
    const awbcode   = req.nextUrl.searchParams.get("awbcode")   || "";
    const grower_uq = req.nextUrl.searchParams.get("grower_uq") || "";
    if (!date_invo || !awbcode)
        return NextResponse.json({ success: false, error: "date_invo and awbcode are required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_packing_duties_products_credit_report", {
            lddate_invo:  date_invo,
            lcawbcode:    awbcode,
            lcgrower_uq:  grower_uq,
        });
        return NextResponse.json({ success: true, records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
