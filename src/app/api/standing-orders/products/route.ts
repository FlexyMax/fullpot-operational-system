import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q    = searchParams.get("q") ?? "";
    const desc = q ? `%${q}%` : "%";
    try {
        const r = await executeProcedure("sp_flower_boxes_list", {
            lcdescription: desc,
            lcshort:       "%",
            lcold_code:    "%",
        });
        const limit = parseInt(searchParams.get("limit") ?? "60");
        const rows = (r.recordset ?? []).slice(0, limit);
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
