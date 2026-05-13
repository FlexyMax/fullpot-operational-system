import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { invoiceNo, warehouse_uq } = await req.json();

        const result = await executeProcedure("sp_NC_customers_invoice_header", {
            invoice_no: invoiceNo,
            wphysical_uq: warehouse_uq || "%"
        });

        return NextResponse.json(result.recordset);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
