import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const supplier_uq = req.nextUrl.searchParams.get("supplier_uq") ?? "";
    const bank_uq     = req.nextUrl.searchParams.get("bank_uq")     ?? "";
    if (!supplier_uq || !bank_uq) return NextResponse.json({ error: "supplier_uq and bank_uq required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_outcome_by_supplier_bank", {
            lcSupplier_uq: supplier_uq,
            lcBank_uq:     bank_uq,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
