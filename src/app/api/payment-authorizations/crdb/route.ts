import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

// GET  ?invoice_uq=xxx  → sp_flower_accounts_pay_credits_debits
// POST                  → sp_flower_accounts_pay_cr_insert
// PUT                   → sp_flower_accounts_pay_cr_update
// DELETE                → sp_flower_accounts_pay_cr_delete

export async function GET(req: NextRequest) {
    const invoice_uq = req.nextUrl.searchParams.get("invoice_uq") ?? "";
    if (!invoice_uq) return NextResponse.json([]);
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_credits_debits", { lcapayable_uq: invoice_uq });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { type, cd_date, acc_pay_uq, reason_uq, amount, details } = await req.json();
    try {
        const r = await executeProcedure("sp_NC_accounts_pay_crdb_insert", {
            acc_pay_uq:   acc_pay_uq   || "",
            type:         type         || "C",
            cd_date:      cd_date,
            reason_uq:    reason_uq    || "",
            cd_ammount:   parseFloat(amount) || 0,
            retention_no: "",
            details:      (details ?? "").substring(0, 250),
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Insert failed" }, { status: 400 });
        serverAuditLog(PANTA, "Insert", "flower_accounts_pay_crdb", row?.unico ?? acc_pay_uq).catch(() => {});
        return NextResponse.json({ success: true, data: { unico: row?.unico } });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { unico, type, cd_date, reason_uq, amount, details } = await req.json();
    try {
        const r = await executeProcedure("sp_NC_accounts_pay_crdb_update", {
            unico:        unico,
            type:         type         || "C",
            cd_date:      cd_date,
            reason_uq:    reason_uq    || "",
            cd_ammount:   parseFloat(amount) || 0,
            retention_no: "",
            details:      (details ?? "").substring(0, 250),
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Update failed" }, { status: 400 });
        serverAuditLog(PANTA, "Edit", "flower_accounts_pay_crdb", unico).catch(() => {});
        return NextResponse.json({ success: true, data: { unico: row?.unico ?? unico } });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { crdb_uq } = await req.json();
    try {
        const r = await executeProcedure("sp_NC_accounts_pay_crdb_delete", { unico: crdb_uq });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Delete failed" }, { status: 400 });
        serverAuditLog(PANTA, "Delete", "flower_accounts_pay_crdb", crdb_uq).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
