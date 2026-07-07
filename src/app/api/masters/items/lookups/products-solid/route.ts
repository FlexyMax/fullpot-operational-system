import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const search = new URL(req.url).searchParams.get("search") || "%";
    try {
        const r = await executeProcedure("sp_flower_products_list_solid", { lcdescription: search });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
