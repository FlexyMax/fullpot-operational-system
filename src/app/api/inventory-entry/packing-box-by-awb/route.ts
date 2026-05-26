import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const awbcode = req.nextUrl.searchParams.get("awbcode") || "";
    try {
        const r = await executeProcedure("sp_flower_packing_box_by_awb", {
            lcawbcode: awbcode,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
