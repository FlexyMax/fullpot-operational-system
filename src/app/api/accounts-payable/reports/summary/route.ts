import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower_uq = req.nextUrl.searchParams.get("grower_uq") || "%";
    const from      = req.nextUrl.searchParams.get("from")      || "";
    const to        = req.nextUrl.searchParams.get("to")        || "";
    if (!from || !to) return NextResponse.json({ error: "from and to dates required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_summary", {
            lcgrower_uq: grower_uq,
            ldfrom:      from,
            ldto:        to,
        });
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
