import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const awb  = req.nextUrl.searchParams.get("awb")  || "%";
    const date = req.nextUrl.searchParams.get("date");
    try {
        const r = await executeProcedure("sp_flower_packing_x_awb", {
            awbcode: awb,
            lddate:  new Date(date || new Date().toISOString().split("T")[0]),
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
