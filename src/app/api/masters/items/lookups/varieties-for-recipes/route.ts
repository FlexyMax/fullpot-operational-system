import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const lcsearch = new URL(req.url).searchParams.get("search") || "%";
    try {
        const r = await executeProcedure("sp_flower_varieties_search_to_recipes", { lcsearch });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
