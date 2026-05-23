import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const supplier_uq = req.nextUrl.searchParams.get("supplier_uq") ?? "";
    const balance     = req.nextUrl.searchParams.get("balance") ?? "pos"; // pos | zero | all
    if (!supplier_uq) return NextResponse.json({ error: "supplier_uq required" }, { status: 400 });
    try {
        let r;
        if (balance === "all") {
            // Fetch both pos and zero and merge
            const [pos, zero] = await Promise.all([
                executeProcedure("sp_flower_supplier_invoices", { lcSupplier_uq: supplier_uq, llbalance: 1 }),
                executeProcedure("sp_flower_supplier_invoices", { lcSupplier_uq: supplier_uq, llbalance: 0 }),
            ]);
            const seen = new Set<string>();
            const merged = [...pos.recordset, ...zero.recordset].filter(row => {
                const key = String(row.UNICO ?? row.unico ?? JSON.stringify(row));
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            return NextResponse.json(merged);
        }
        r = await executeProcedure("sp_flower_supplier_invoices", {
            lcSupplier_uq: supplier_uq,
            llbalance:     balance === "pos" ? 1 : 0,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
