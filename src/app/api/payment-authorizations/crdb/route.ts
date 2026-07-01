import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

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
        const r = await executeProcedure("sp_flower_accounts_pay_cr_insert", {
            lctype:       type,
            ldcd_date:    new Date(cd_date),
            lcacc_pay_uq: acc_pay_uq,
            lcreason_uq:  reason_uq,
            lnamount:     parseFloat(amount) || 0,
            lcdetails:    details ?? "",
        });
        const result = r.recordset?.[0];
        if (result?.error === 1) return NextResponse.json({ success: false, error: result.message }, { status: 422 });
        return NextResponse.json({ success: true, data: result });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { unico, type, cd_date, acc_pay_uq, reason_uq, amount, details } = await req.json();
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_cr_update", {
            lcunico:      unico,
            lctype:       type,
            ldcd_date:    new Date(cd_date),
            lcacc_pay_uq: acc_pay_uq,
            lcreason_uq:  reason_uq,
            lnamount:     parseFloat(amount) || 0,
            lcdetails:    details ?? "",
        });
        const result = r.recordset?.[0];
        if (result?.error === 1) return NextResponse.json({ success: false, error: result.message }, { status: 422 });
        return NextResponse.json({ success: true, data: result });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { crdb_uq } = await req.json();
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_cr_delete", { lccrdb_uq: crdb_uq });
        const result = r.recordset?.[0];
        if (result?.error === 1) return NextResponse.json({ success: false, error: result.message }, { status: 422 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
