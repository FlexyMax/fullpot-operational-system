import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const from    = req.nextUrl.searchParams.get("from")    || new Date().toISOString().split("T")[0];
    const to      = req.nextUrl.searchParams.get("to")      || new Date().toISOString().split("T")[0];
    const airline = req.nextUrl.searchParams.get("airline") || "%";
    try {
        const r = await executeProcedure("sp_flower_awbs_by_date", {
            start_date:      from,
            end_date:        to,
            lcairline_code:  airline,
        });
        return NextResponse.json({ records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
