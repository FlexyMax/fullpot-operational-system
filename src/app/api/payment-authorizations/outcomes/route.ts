import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower_uq = req.nextUrl.searchParams.get("grower_uq") ?? "";
    const ldfrom    = req.nextUrl.searchParams.get("ldfrom")    ?? "";
    const lnclose   = parseInt(req.nextUrl.searchParams.get("lnclose") ?? "0", 10);
    if (!grower_uq) return NextResponse.json({ error: "grower_uq required" }, { status: 400 });

    const base = { lcgrower_uq: grower_uq, ldfrom: new Date(ldfrom || "2000-01-01") };

    try {
        const dbLnclose = lnclose === -1 ? 3 : lnclose === 0 ? 1 : lnclose === 1 ? 2 : lnclose;
        const r = await executeProcedure("sp_flower_growers_payments", { ...base, lnclose: dbLnclose });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
