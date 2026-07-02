import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ uq: string }> }) {
    const { uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_accounts_outcome_uq", { lcunico: uq });
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT → SP_flower_accounts_outcome_Update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ uq: string }> }) {
    const { uq } = await params;
    const { out_date, bank_uq, supplier_uq, out_ammount, out_total, details, pay_doc } = await req.json();
    try {
        await executeProcedure("SP_flower_accounts_outcome_Update", {
            unico:        uq,
            timestamp:    new Date(),
            out_date:     new Date(out_date),
            bank_uq:      bank_uq,
            supplier_uq:  supplier_uq,
            out_ammount:  parseFloat(out_ammount) || 0,
            out_total:    parseFloat(out_total)   || 0,
            details:      details ?? "",
            pay_doc:      parseInt(pay_doc)       || 0,
        });
        serverAuditLog(PANTA, "Edit", "flower_accounts_outcomes", uq).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// DELETE → SP_flower_accounts_outcome_Delete
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ uq: string }> }) {
    const { uq } = await params;
    try {
        await executeProcedure("SP_flower_accounts_outcome_Delete", { unico: uq });
        serverAuditLog(PANTA, "Delete", "flower_accounts_outcomes", uq).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
