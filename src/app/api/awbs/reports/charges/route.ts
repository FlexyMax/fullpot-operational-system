import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// sp_flower_awbs_charges_report param: @lcawbcode varchar(11)

export async function GET(req: NextRequest) {
    const awbcode = req.nextUrl.searchParams.get("awbcode") || "";
    if (!awbcode)
        return NextResponse.json({ success: false, error: "awbcode is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_awbs_charges_report", { lcawbcode: awbcode });
        return NextResponse.json({ success: true, records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
