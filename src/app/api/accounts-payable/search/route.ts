import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const farm       = req.nextUrl.searchParams.get("farm")       || "%";
    const invoice_no = req.nextUrl.searchParams.get("invoice_no") || "%";
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_search", {
            lcfarm:       farm,
            lcinvoice_no: invoice_no,
        });
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
