import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "";
    if (!search.trim()) return NextResponse.json([]);
    try {
        const r = await executeProcedure("sp_flower_customers_list_to_change_prebooks", { lcsearch: search });
        return NextResponse.json((r.recordset ?? []).slice(0, 200));
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
