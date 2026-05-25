import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower_uq = req.nextUrl.searchParams.get("grower_uq") ?? "";
    const ldfrom    = req.nextUrl.searchParams.get("ldfrom")    ?? "";
    const lnclose   = parseInt(req.nextUrl.searchParams.get("lnclose") ?? "0", 10);
    if (!grower_uq) return NextResponse.json({ error: "grower_uq required" }, { status: 400 });

    const base = { lcgrower_uq: grower_uq, ldfrom: new Date(ldfrom || "2000-01-01") };

    try {
        if (lnclose === -1) {
            // All — merge pending + paid, dedup by UNICO
            const [pending, paid] = await Promise.all([
                executeProcedure("sp_flower_growers_payments", { ...base, lnclose: 0 }),
                executeProcedure("sp_flower_growers_payments", { ...base, lnclose: 1 }),
            ]);
            const seen = new Set<string>();
            const merged = [...pending.recordset, ...paid.recordset].filter(row => {
                const key = String(row.UNICO ?? row.unico ?? JSON.stringify(row));
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            return NextResponse.json(merged);
        }

        const r = await executeProcedure("sp_flower_growers_payments", { ...base, lnclose });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
