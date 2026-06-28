import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// "Gen. Invoices" (Lines panel) — confirmed live via the proc's own header
// comment: "insertar invoice desde prebook to invoice boton Gen Invoices".
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const pbook_uq = String(b.pbook_uq ?? "");
    if (!pbook_uq) return NextResponse.json({ error: "pbook_uq required" }, { status: 400 });
    try {
        const salProfile = await executeProcedure("sp_flower_salesman_uq", {
            lcunico: "%",
            lcuser_uq: (session as any).user?.id ?? "",
        });
        const salesman_uq = salProfile.recordset?.[0]?.unico ?? "";
        const r = await executeProcedure("sp_flower_invoice_insert_from_prebook_to_invoice", {
            lcpbook_uq:    pbook_uq,
            lcsalesman_uq: salesman_uq,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, invoice_uq: row?.invoice_uq ?? row?.INVOICE_UQ ?? null });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
