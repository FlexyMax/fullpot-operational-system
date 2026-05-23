import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const pack_uq = req.nextUrl.searchParams.get("pack_uq") ?? "";
    if (!pack_uq) return NextResponse.json({ error: "pack_uq required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_packing_status_report", {
            lcpack_uq: pack_uq,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
