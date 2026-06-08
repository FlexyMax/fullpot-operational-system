import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "%";
    try {
        const r = await executeProcedure("sp_NC_salesman_list", {
            lcsearch: search,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
