import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: Request, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_accounts_rec_crdb_up", { lccrdb_uq: unico });
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    if (!b.type)       return NextResponse.json({ success: false, error: "Document type is empty." }, { status: 400 });
    if (!b.reason_uq)  return NextResponse.json({ success: false, error: "Reason is empty." }, { status: 400 });
    if (!b.cd_ammount) return NextResponse.json({ success: false, error: "Amount is empty." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_accounts_rec_credits_update", {
            lccrdb_uq:    unico,
            lctype:       b.type,
            ldcd_date:    b.cd_date,
            lcacc_rec_uq: b.acc_rec_uq ?? "",
            lcreason_uq:  b.reason_uq,
            lnamount:     b.cd_ammount,
            lcdetails:    b.details ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_accounts_rec_credits_delete", { lccrdb_uq: unico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
