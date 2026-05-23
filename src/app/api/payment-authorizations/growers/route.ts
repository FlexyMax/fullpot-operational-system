import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const all = req.nextUrl.searchParams.get("all") === "1" ? 0 : 1;
    try {
        const r = await executeProcedure("sp_flower_growers_list", { llall: all });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
