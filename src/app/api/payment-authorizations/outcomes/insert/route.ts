import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

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
        const rec = r.recordset[0] ?? null;
        serverAuditLog(PANTA, "Insert", "flower_accounts_outcomes", rec?.unico ?? body.bank_uq).catch(() => {});
        return NextResponse.json({ success: true, data: rec });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
