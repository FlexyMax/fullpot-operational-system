import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// sp_NC_packing_duties_products_credit_report params:
// @ldprint_date datetime, @lcprint_awb varchar(11), @lcprint_pk_uq char(8)

export async function GET(req: NextRequest) {
    const date_invo  = req.nextUrl.searchParams.get("date_invo")  || "";
    const awbcode    = req.nextUrl.searchParams.get("awbcode")    || "";
    const grower_uq  = req.nextUrl.searchParams.get("grower_uq")  || "";
    if (!awbcode)
        return NextResponse.json({ success: false, error: "awbcode is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_NC_packing_duties_products_credit_report", {
            ldprint_date:  date_invo || new Date().toISOString().split("T")[0],
            lcprint_awb:   awbcode,
            lcprint_pk_uq: grower_uq,
        });
        return NextResponse.json({ success: true, records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
