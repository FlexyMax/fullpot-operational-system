import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower_uq = req.nextUrl.searchParams.get("grower_uq");
    if (!grower_uq) return NextResponse.json({ error: "grower_uq required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_growers_terms", { lcgrower_uq: grower_uq });
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
