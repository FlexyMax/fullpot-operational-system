import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const growerUq = req.nextUrl.searchParams.get("grower_uq") ?? "";
    const from     = req.nextUrl.searchParams.get("from")      ?? "";
    const to       = req.nextUrl.searchParams.get("to")        ?? "";
    if (!growerUq) return NextResponse.json({ error: "grower_uq required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_cr_history", {
            lcgrower_uq: growerUq,  // verified: @lcgrower_uq(varchar)
            ldcr_from:   from,      // verified: @ldcr_from(datetime) — NOT ldcrdb_from
            ldcr_to:     to,        // verified: @ldcr_to(datetime)   — NOT ldcrdb_to
        });
        const rows = (r.recordset ?? []).map((row: any) =>
            Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]))
        );
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

