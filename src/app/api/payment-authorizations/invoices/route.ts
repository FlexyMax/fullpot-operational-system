import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const supplier_uq = req.nextUrl.searchParams.get("supplier_uq") ?? "";
    const balance     = req.nextUrl.searchParams.get("balance") ?? "pos"; // pos | zero | all
    if (!supplier_uq) return NextResponse.json({ error: "supplier_uq required" }, { status: 400 });

    try {
        if (balance === "pos") {
            // BAL > 0 — unpaid/pending invoices
            const r = await executeProcedure("sp_flower_supplier_invoices", {
                lcSupplier_uq: supplier_uq,
                llbalance: 1,
            });
            return NextResponse.json(r.recordset);
        }

        if (balance === "zero") {
            // BAL = 0 — paid invoices
            const r = await executeProcedure("sp_flower_supplier_invoices", {
                lcSupplier_uq: supplier_uq,
                llbalance: 0,
            });
            return NextResponse.json(r.recordset);
        }

        // ALL — paid + unpaid merged
        const [unpaid, paid] = await Promise.all([
            executeProcedure("sp_flower_supplier_invoices", {
                lcSupplier_uq: supplier_uq,
                llbalance: 1,
            }),
            executeProcedure("sp_flower_supplier_invoices", {
                lcSupplier_uq: supplier_uq,
                llbalance: 0,
            }),
        ]);
        const merged = [...unpaid.recordset, ...paid.recordset];
        return NextResponse.json(merged);

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
