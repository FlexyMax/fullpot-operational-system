import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const mode = req.nextUrl.searchParams.get("mode") || "list"; // "last" for add, "list" for edit
    try {
        const sp = mode === "last" ? "sp_flower_banks_last_bank" : "sp_flower_banks_list";
        const r  = await executeProcedure(sp, {});
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
