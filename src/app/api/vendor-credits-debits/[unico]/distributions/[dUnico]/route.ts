import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "2495F7A8";
const TABLA = "flower_accounts_pay_crdb_pob";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string; dUnico: string }> }) {
    const { unico, dUnico } = await params;
    const body = await req.json();
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_crdb_pob_update", {
            lcunico:      dUnico,
            lcapcrdb_uq:  unico,
            lcpob_uq:     body.lcpob_uq,
            lncredit_pob: body.lncredit_pob,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Edit", TABLA, dUnico).catch(() => {});
        return NextResponse.json({ success: true, message: row?.Message || "Distribution updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ unico: string; dUnico: string }> }) {
    const { dUnico } = await params;
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_crdb_pob_delete", { lcunico: dUnico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Delete", TABLA, dUnico).catch(() => {});
        return NextResponse.json({ success: true, message: row?.Message || "Distribution deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
