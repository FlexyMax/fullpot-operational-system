import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/scan-out/verify
// body: { invoice_uq: string, invoice_no: number }
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { invoice_uq, invoice_no } = await req.json();
    if (!invoice_uq || !invoice_no) return NextResponse.json({ error: "Missing invoice_uq or invoice_no" }, { status: 400 });

    try {
        const r = await executeProcedure("sp_flower_packing_box_control_verify", {
            lcinvbox_uq: String(invoice_uq).trim(),
            InvoiceNo:   Number(invoice_no),
        });

        const row = r.recordset?.[0];
        if (!row) return NextResponse.json({ error: "No data returned" }, { status: 400 });
        if (row.error || row.Error) return NextResponse.json({ error: String(row.message ?? row.Message ?? "Verification failed") }, { status: 400 });
        if (!row.pk_box_uq) return NextResponse.json({ error: "Invoice barcode not found in this order" }, { status: 400 });

        return NextResponse.json({ pk_box_uq: String(row.pk_box_uq).trim(), compuesto: String(row.compuesto ?? "").trim() });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
