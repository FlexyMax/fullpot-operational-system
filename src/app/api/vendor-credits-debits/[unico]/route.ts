import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "2495F7A8";
const TABLA = "flower_accounts_pay_crdb";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r   = await executeProcedure("sp_flower_accounts_pay_cr", { lcunico: unico });
        const row = r.recordset?.[0] ?? null;
        if (!row) return NextResponse.json(null);
        const normalized = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]));
        return NextResponse.json(normalized);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const body = await req.json();
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_cr_update", {
            lcunico:      unico,
            lctype:       body.lctype,
            ldcd_date:    body.ldcd_date,
            lcacc_pay_uq: body.lcacc_pay_uq,
            lcreason_uq:  body.lcreason_uq,
            lncd_ammount: body.lncd_ammount,
            lcdetails:    body.lcdetails ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Error updating record" }, { status: 400 });
        serverAuditLog(PANTA, "Edit", TABLA, unico).catch(() => {});
        return NextResponse.json({ success: true, unico, message: row?.Message || "Credit/Debit updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_cr_delete", { lcunico: unico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Error deleting record" }, { status: 400 });
        serverAuditLog(PANTA, "Delete", TABLA, unico).catch(() => {});
        return NextResponse.json({ success: true, unico, message: row?.Message || "Credit/Debit deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
