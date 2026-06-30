import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ unico: string }> };

export async function PUT(req: Request, { params }: P) {
    const { unico } = await params;
    const { bank_doc, pay_amount, pay_date } = await req.json();
    try {
        // Note: @bank_doc is numeric(8,0) in DB (verified 2026-05-18) — pass as integer
        const r = await executeProcedure("sp_flower_corporate_income_update", {
            unico:      unico,
            bank_doc:   parseInt(bank_doc) || 0,
            pay_amount: pay_amount ?? 0,
            pay_date:   pay_date,
        });
        const row = r.recordset?.[0];
        if (row?.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_corporate_income_delete", { unico });
        const row = r.recordset?.[0];
        if (row?.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
