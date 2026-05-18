import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ unico: string }> };

export async function POST(req: Request, { params }: P) {
    const { unico } = await params;
    const { amount, action, customer_uq, extension } = await req.json();
    // action: "approve" | "deny" | "extension"
    try {
        if (action === "extension") {
            const r = await executeProcedure("sp_flower_customers_update_extension", {
                lcunico:     customer_uq,
                lncr_limit:  amount ?? 0,
                lnextension: parseInt(extension) || 0,
            });
            const row = r.recordset?.[0];
            if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
            return NextResponse.json({ success: true });
        }
        const r = await executeProcedure("sp_flower_invoice_credit_override_update", {
            lcunico:     unico,
            lnamount:    amount ?? 0,
            llapproved:  action === "approve" ? 1 : 0,
            lldenied:    action === "deny"    ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
