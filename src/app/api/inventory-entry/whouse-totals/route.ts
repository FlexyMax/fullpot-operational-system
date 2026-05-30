import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);

// GET /api/inventory-entry/whouse-totals?date=YYYY-MM-DD&whouse=UNICO
export async function GET(req: NextRequest) {
    const date   = req.nextUrl.searchParams.get("date")   || new Date().toISOString().split("T")[0];
    const whouse = req.nextUrl.searchParams.get("whouse") || "";
    try {
        const r = await executeProcedure("sp_flower_awb_by_date_wphouse", {
            lddate:  new Date(date),
            wphouse: str(whouse, 8),
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
