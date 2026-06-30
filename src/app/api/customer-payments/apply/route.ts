import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const b = await req.json();
    if (!b.invoice_uq) return NextResponse.json({ success: false, error: "Invoice is empty." }, { status: 400 });
    if (!b.income_uq)  return NextResponse.json({ success: false, error: "Income is empty." }, { status: 400 });
    if (!b.in_ammount) return NextResponse.json({ success: false, error: "Amount is empty." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_accounts_income_details_insert", {
            lcIncome_uq:   b.income_uq,
            lcAcc_recd_uq: b.invoice_uq,
            lnIn_ammount:  b.in_ammount,
        });
        const row = r.recordset?.[0];
        if (row?.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
