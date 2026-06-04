import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/history/credits?invoice_uq=XXX
// sp_NC_invoice_box_credit(@lcinvoice_uq)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const invoiceUq = req.nextUrl.searchParams.get("invoice_uq") || "";
        const r = await executeProcedure("sp_NC_invoice_box_credit", { lcinvoice_uq: invoiceUq });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
