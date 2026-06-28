import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// "Make Invoices" (Customers panel) — bulk, scoped to one customer + date.
// VFP tooltip: "Make invoices by customer and shipto". Confirmed live via the
// proc's own header comment ("insertar invoice ... para un cliente").
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const customer_uq = String(b.customer_uq ?? "");
    const date = String(b.date ?? "");
    const mode = String(b.mode ?? "delivery");
    if (!customer_uq || customer_uq === "%") return NextResponse.json({ error: "Select a specific customer first" }, { status: 400 });
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
    try {
        const salProfile = await executeProcedure("sp_flower_salesman_uq", {
            lcunico: "%",
            lcuser_uq: (session as any).user?.id ?? "",
        });
        const salesman_uq = salProfile.recordset?.[0]?.unico ?? "";
        const r = await executeProcedure("sp_flower_invoice_insert_by_customer", {
            lccustomer_uq: customer_uq,
            lcsalesman_uq: salesman_uq,
            lddate_filter: new Date(date),
            llpbdate: mode === "delivery" ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.message2 || row?.message });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
