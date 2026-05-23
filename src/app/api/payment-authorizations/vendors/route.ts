import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower = req.nextUrl.searchParams.get("grower") ?? "";
    try {
        const r = await executeProcedure("sp_flower_growers_list_to_accounts_payable", {
            lcgrower: grower,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
