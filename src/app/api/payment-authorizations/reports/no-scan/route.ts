import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const awbdate    = req.nextUrl.searchParams.get("awbdate")    ?? new Date().toISOString();
    const packing_uq = req.nextUrl.searchParams.get("packing_uq") ?? "";
    try {
        const r = await executeProcedure("sp_flower_packing_box_control_no_scan_report", {
            ldawbdate:    awbdate,
            lcpacking_uq: packing_uq,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
