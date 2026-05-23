import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// POST { bank_uq, supplier_uq, out_ammount, out_total, details, pay_doc }
export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        const r = await executeProcedure("sp_flower_accounts_outcome_insert", {
            out_date:    new Date().toISOString(),
            bank_uq:     body.bank_uq     ?? "",
            supplier_uq: body.supplier_uq ?? "",
            out_ammount: body.out_ammount ?? 0,
            out_total:   body.out_total   ?? 0,
            details:     body.details     ?? "",
            pay_doc:     body.pay_doc     ?? 0,
        });
        return NextResponse.json({ success: true, data: r.recordset[0] ?? null });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
