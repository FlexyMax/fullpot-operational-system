import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q") || "";
    if (!q) return NextResponse.json({ records: [] });
    try {
        const r = await executeProcedure("sp_flower_awb_search", { lcawbcode: q });
        return NextResponse.json({ records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
