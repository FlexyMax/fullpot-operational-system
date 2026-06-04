import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/pos/invoice/line/barcode — add by barcode/compuesto
// sp_NC_invoice_flexymax_box_insert_barcode(@invoice_uq, @lccompuesto, @lcuser_uq)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { invoice_uq, barcode } = await req.json();
        const userId = (session.user as any).id ?? "";
        const r = await executeProcedure("sp_NC_invoice_flexymax_box_insert_barcode", {
            invoice_uq:  invoice_uq,
            lccompuesto: barcode.trim().toUpperCase(),
            lcuser_uq:   userId,
        });
        const row = r.recordset?.[0];
        const msg = String(row?.mensaje ?? row?.message ?? "").trim();
        const hasError = row?.error === true || row?.error === 1;
        if (hasError && !msg.toLowerCase().includes("already")) {
            return NextResponse.json({ success: false, error: msg || "Scan failed" }, { status: 400 });
        }
        return NextResponse.json({ success: true, warning: hasError ? msg : undefined, unico: row?.unico ?? null });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
