import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "%";
    const param  = search.includes("%") ? search : `%${search}%`;
    try {
        const r = await executeProcedure("sp_flower_customers_list_for_statement", {
            lccustomer_name: param,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
