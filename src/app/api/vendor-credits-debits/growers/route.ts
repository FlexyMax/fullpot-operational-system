import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q") ?? "";
    try {
        const r = await executeProcedure("sp_flower_growers_list_search", {
            lcgrower_name: q ? `%${q}%` : "%",  // verified: @lcgrower_name(varchar) — NOT lcfarm
        });
        const rows = (r.recordset ?? []).map((row: any) =>
            Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]))
        );
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

