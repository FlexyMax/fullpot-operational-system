import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const r = await executeProcedure("sp_flower_real_inventory_totals", {});
        return NextResponse.json(r.recordset?.[0] ?? {});
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
