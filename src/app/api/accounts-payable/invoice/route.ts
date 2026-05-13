import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_up", { lcinvoice_uq: unico });
        return NextResponse.json(result.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
