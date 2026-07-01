import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const r = await executeProcedure("sp_flower_growers_pending_accounts_last_quarter", {});
        if (req.nextUrl.searchParams.get("format") === "columns") {
            const cols = r.recordset.length > 0 ? Object.keys(r.recordset[0]) : [];
            return NextResponse.json(cols);
        }
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
