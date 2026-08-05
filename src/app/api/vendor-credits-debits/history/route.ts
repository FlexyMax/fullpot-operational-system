import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const growerUq = req.nextUrl.searchParams.get("grower_uq") ?? "";
    const from     = req.nextUrl.searchParams.get("from")      ?? "";
    const to       = req.nextUrl.searchParams.get("to")        ?? "";
    // empty growerUq = ALL vendors (SP handles it)
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_cr_history", {
            lcgrower_uq: growerUq || null,  // null = ALL vendors; '' = WHERE grower_uq='' (0 results)
            ldcr_from:   from,
            ldcr_to:     to,
        });
        const rows = (r.recordset ?? []).map((row: any) =>
            Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]))
        );
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

