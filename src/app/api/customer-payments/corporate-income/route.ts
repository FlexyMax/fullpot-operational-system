import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const { customer_uq, bank_doc, pay_amount, pay_date } = await req.json();
    if (!customer_uq || !pay_amount) return NextResponse.json({ success: false, error: "Customer and amount are required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_corporate_income_insert", {
            customer_uq: customer_uq,
            bank_doc:    bank_doc ?? "",
            pay_amount:  pay_amount,
            pay_date:    pay_date,
        });
        const row = r.recordset?.[0];
        if (row?.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
