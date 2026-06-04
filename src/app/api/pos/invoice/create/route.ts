import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/pos/invoice/create { customer_uq, date, salesman_uq, pbook_uq? }
// sp_flower_invoice_insert(@lccustomer_uq, @lddate, @lcSalesman_uq, @lcpbook_uq)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { customer_uq, date, salesman_uq, pbook_uq = "" } = await req.json();
        if (!customer_uq || !salesman_uq) return NextResponse.json({ error: "customer_uq and salesman_uq required" }, { status: 400 });
        const r = await executeProcedure("sp_flower_invoice_insert", {
            lccustomer_uq: customer_uq,
            lddate:        new Date(date || new Date().toISOString().split("T")[0]),
            lcSalesman_uq: salesman_uq,
            lcpbook_uq:    pbook_uq || "",
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.error === true)
            return NextResponse.json({ success: false, error: row.message || row.mensaje || "Failed" }, { status: 400 });
        const unico = row?.unico ?? row?.UNICO ?? null;
        return NextResponse.json({ success: true, unico });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
