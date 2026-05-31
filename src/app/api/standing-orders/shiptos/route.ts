import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const customer_uq = req.nextUrl.searchParams.get("customer_uq") ?? "";
    if (!customer_uq) return NextResponse.json([], { status: 200 });
    try {
        const r = await executeProcedure("sp_fweb_customer_shipto_search_by_unico", {
            lccustomer_uq: customer_uq,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
