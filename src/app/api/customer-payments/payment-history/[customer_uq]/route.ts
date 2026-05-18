import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
type P = { params: Promise<{ customer_uq: string }> };

export async function GET(_req: Request, { params }: P) {
    const { customer_uq } = await params;
    try {
        const r = await executeQuery(`
            SELECT unico, automatic, type_uq, in_date, bank_uq, customer_uq,
                   in_ammount, in_total, in_balance, card, credit_card_no,
                   approval, exp_month, exp_year, details, bank_doc,
                   deposit, void, void_date
            FROM flower_accounts_income
            WHERE customer_uq = '${txt(customer_uq)}'
            ORDER BY in_date DESC, identity_column DESC
        `);
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
