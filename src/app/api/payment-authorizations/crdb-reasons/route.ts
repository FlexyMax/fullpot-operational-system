import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET → sp_flower_crdb_reasons_list
// Returns: unico, code, reason, chargegrow, returninv, glaccount, adjusts

export async function GET() {
    try {
        const r = await executeProcedure("sp_flower_crdb_reasons_list", {});
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
