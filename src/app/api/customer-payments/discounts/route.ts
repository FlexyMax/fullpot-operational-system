import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const { invoice_uq, salesman_uq } = await req.json();
    try {
        const r = await executeProcedure("sp_flower_accounts_rec_details_discounts_insert", {
            lcinvoice_uq:  invoice_uq,
            lcsalesman_uq: salesman_uq,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const invoice_uq = req.nextUrl.searchParams.get("invoice_uq") || "";
    try {
        const r = await executeProcedure("sp_flower_accounts_rec_details_discounts_delete", {
            lcinvoice_uq: invoice_uq,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
