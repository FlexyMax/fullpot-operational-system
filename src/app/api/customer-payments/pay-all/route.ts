import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const { income_uq, customer_uq } = await req.json();
    if (!income_uq || !customer_uq)
        return NextResponse.json({ success: false, error: "income_uq and customer_uq are required" }, { status: 400 });
    try {
        // 1. Get income details
        const incomeRes = await executeProcedure("sp_flower_accounts_income_up", { lcincome_uq: income_uq });
        const income    = incomeRes.recordset?.[0];
        if (!income) return NextResponse.json({ success: false, error: "Income not found" }, { status: 404 });

        let remainingBalance = parseFloat(income.in_balance ?? income.in_ammount ?? 0);
        if (remainingBalance <= 0)
            return NextResponse.json({ success: false, error: "Income has no remaining balance." }, { status: 400 });

        // 2. Get invoices with balance
        const invRes = await executeProcedure("sp_flower_customer_invoices", {
            lcCustomer_uq: customer_uq,
            balance: 1,
        });
        const invoices = invRes.recordset.filter((inv: any) => !inv.void && parseFloat(inv.balance ?? 0) > 0);

        let applied_count = 0;
        for (const inv of invoices) {
            if (remainingBalance <= 0) break;
            const invBalance = parseFloat(inv.balance ?? 0);
            const amount     = Math.min(invBalance, remainingBalance);
            await executeProcedure("sp_flower_accounts_rec_x_income_insert", {
                lnIn_Amount:   amount,
                lcAcc_recd_uq: inv.unico,
                lcIncome_uq:   income_uq,
            });
            remainingBalance -= amount;
            applied_count++;
        }
        return NextResponse.json({ success: true, applied_count, message: `Applied to ${applied_count} invoice(s).` });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
