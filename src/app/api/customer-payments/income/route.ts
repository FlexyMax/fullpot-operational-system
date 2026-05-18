import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const b = await req.json();
    if (!b.type_uq)      return NextResponse.json({ success: false, error: "Income type empty." }, { status: 400 });
    if (!b.bank_uq)      return NextResponse.json({ success: false, error: "Bank empty." }, { status: 400 });
    if (!b.in_ammount)   return NextResponse.json({ success: false, error: "Income amount is empty." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_accounts_income_insert", {
            ldin_date:       b.in_date,
            lccustomer_uq:   b.customer_uq,
            lctype_uq:       b.type_uq,
            lcbank_uq:       b.bank_uq,
            lnin_ammount:    b.in_ammount,
            lcbank_doc:      b.bank_doc   ?? "",
            lndeposit:       parseInt(b.deposit) || 0,
            lccard:          b.card       ?? "",
            lcapproval:      b.approval   ?? "",
            lcdetails:       b.details    ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
