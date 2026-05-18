import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const b = await req.json();
    if (!b.type)       return NextResponse.json({ success: false, error: "Document type is empty." }, { status: 400 });
    if (!b.reason_uq)  return NextResponse.json({ success: false, error: "Reason is empty." }, { status: 400 });
    if (!b.cd_ammount) return NextResponse.json({ success: false, error: "Amount is empty." }, { status: 400 });
    try {
        // sp_flower_accounts_rec_credits_insert — verified 2026-05-18
        // @lnamount not @cd_ammount
        const r = await executeProcedure("sp_flower_accounts_rec_credits_insert", {
            lctype:        b.type,
            ldcd_date:     b.cd_date,
            lcacc_rec_uq:  b.acc_rec_uq  ?? "",
            lcreason_uq:   b.reason_uq,
            lnamount:      b.cd_ammount,
            lcdetails:     b.details     ?? "",
            llall_invoices: b.all_invoices ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
