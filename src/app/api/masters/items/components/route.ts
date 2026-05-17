import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "%";
    try {
        // SP wraps @lcsearch with % internally: concat(description, old_code, ...) LIKE '%'+@lcsearch+'%'
        const r = await executeProcedure("sp_flower_varieties_search", { lcsearch: search });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
