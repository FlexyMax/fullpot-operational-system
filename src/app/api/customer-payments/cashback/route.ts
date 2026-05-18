import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const { income_uq, in_date, in_ammount, details } = await req.json();
    if (!income_uq)  return NextResponse.json({ success: false, error: "Income empty." }, { status: 400 });
    if (!in_ammount) return NextResponse.json({ success: false, error: "Income amount is empty." }, { status: 400 });
    try {
        // sp_flower_accounts_income_cashback — 4 params verified 2026-05-18
        const r = await executeProcedure("sp_flower_accounts_income_cashback", {
            lcincome_uq:  income_uq,
            ldin_date:    in_date,
            lnin_ammount: in_ammount,
            lcdetails:    details ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
