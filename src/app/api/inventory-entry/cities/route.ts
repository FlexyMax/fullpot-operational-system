import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/inventory-entry/cities?search=miami
export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "";
    try {
        const r = await executeProcedure("sp_flower_cities", { lccity: search });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
