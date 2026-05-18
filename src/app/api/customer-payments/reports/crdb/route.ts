import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const { report_option, invoice_uq } = await req.json();
    if (!invoice_uq) return NextResponse.json({ success: false, error: "Invoice empty." }, { status: 400 });
    try {
        const sp = report_option === 2
            ? "sp_flower_accounts_rec_credits_report2"
            : "sp_flower_invoice_credits_report";
        const r = await executeProcedure(sp, { lcinvoice_uq: invoice_uq });
        return NextResponse.json({ success: true, records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
