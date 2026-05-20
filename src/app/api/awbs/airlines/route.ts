import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        // @llall = 1 → return all airlines
        const r = await executeProcedure("sp_flower_airlines_list", { llall: true });
        return NextResponse.json({ records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
