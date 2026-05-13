import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const year = req.nextUrl.searchParams.get("year") || new Date().getFullYear().toString();
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_years_dates", [
            { name: "lnyear", value: parseInt(year) }
        ]);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
