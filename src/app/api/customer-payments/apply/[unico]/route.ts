import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ unico: string }> };

export async function PUT(req: Request, { params }: P) {
    const { unico } = await params;
    const { in_ammount } = await req.json();
    if (!in_ammount) return NextResponse.json({ success: false, error: "Amount is empty." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_accounts_income_details_update", {
            lcUnico:      unico,
            lnIn_ammount: in_ammount,
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
        const r = await executeProcedure("sp_flower_accounts_income_details_delete", { lcUnico: unico });
        const row = r.recordset?.[0];
        if (row?.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
