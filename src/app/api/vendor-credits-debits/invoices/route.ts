import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const growerUq  = req.nextUrl.searchParams.get("grower_uq")   ?? "";
    const type      = req.nextUrl.searchParams.get("type")         ?? "C";
    const accPayUq  = req.nextUrl.searchParams.get("acc_pay_uq")   ?? "";
    if (!growerUq) return NextResponse.json({ error: "grower_uq required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_invoices_to_crdb", {
            lcgrower_uq:  growerUq,
            lctype:       type,
            lcacc_pay_uq: accPayUq,
        });
        const rows = (r.recordset ?? []).map((row: any) =>
            Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]))
        );
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
