import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const { type_uq, in_date, customer_uq, in_amount, bank_doc, in_corp_uq, acc_recd_uq } = await req.json();
    if (!in_corp_uq || !acc_recd_uq) return NextResponse.json({ success: false, error: "Corp income and invoice are required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_corporate_income_invoice_insert", {
            type_uq:     type_uq    ?? "",
            in_date:     in_date,
            customer_uq: customer_uq ?? "",
            in_amount:   in_amount  ?? 0,
            bank_doc:    bank_doc   ?? "",
            in_corp_uq:  in_corp_uq,
            acc_recd_uq: acc_recd_uq,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
