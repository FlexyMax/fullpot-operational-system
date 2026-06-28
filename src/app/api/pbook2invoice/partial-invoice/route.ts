import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const lines: string[] = Array.isArray(b.lines) ? b.lines.map(String) : [];
    const invoice_uq = String(b.invoice_uq ?? "");
    const invoice_no = parseInt(b.invoice_no ?? 0, 10);
    if (lines.length === 0) return NextResponse.json({ error: "Select at least one line" }, { status: 400 });
    if (!invoice_uq) return NextResponse.json({ error: "invoice_uq required" }, { status: 400 });
    try {
        const salProfile = await executeProcedure("sp_flower_salesman_uq", {
            lcunico: "%",
            lcuser_uq: (session as any).user?.id ?? "",
        });
        const salesman_uq = salProfile.recordset?.[0]?.unico ?? "";
        let lastMessage = "";
        for (const pbook_box_uq of lines) {
            const r = await executeProcedure("sp_flower_invoice_insert_from_partial", {
                lcpbook_box_uq: pbook_box_uq,
                lcsalesman_uq: salesman_uq,
                lcInvoice_uq: invoice_uq,
                lninvoice_no: invoice_no,
            });
            const row = r.recordset?.[0];
            if (row?.error === 1 || row?.Error === 1)
                return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
            lastMessage = row?.message || row?.Message || "";
        }
        return NextResponse.json({ success: true, message: lastMessage, count: lines.length });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
