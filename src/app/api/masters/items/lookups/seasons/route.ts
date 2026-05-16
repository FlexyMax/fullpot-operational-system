import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        // sp_flower_prebook_seasons_list — no params; returns flower_prebook_seasons rows
        const r = await executeProcedure("sp_flower_prebook_seasons_list", {});
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
