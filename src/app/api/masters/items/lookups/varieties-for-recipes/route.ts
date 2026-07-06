import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const raw      = new URL(req.url).searchParams.get("search") || "%";
    // SP prepends '%' → append '%' too so LIKE becomes %term% (matches anywhere, not just suffix)
    const lcsearch = raw === "%" ? "%" : raw.endsWith("%") ? raw : `${raw}%`;
    try {
        // Use sp_flower_varieties_search (all classes) so hardgoods appear alongside flowers
        const r = await executeProcedure("sp_flower_varieties_search", { lcsearch });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
