import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const date = req.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];
    try {
        const r = await executeProcedure("sp_flower_customers_corporative_incomes", {
            ldcorporate_date: date,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
