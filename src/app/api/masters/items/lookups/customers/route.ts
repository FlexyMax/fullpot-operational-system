import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        // sp_flower_customers_list_with_all @llall=1 — returns all customers (used as city/buyer in PO prices)
        const r = await executeProcedure("sp_flower_customers_list_with_all", { llall: 1 });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
