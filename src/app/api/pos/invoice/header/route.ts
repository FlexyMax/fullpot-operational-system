import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/invoice/header?uq=XXX
// sp_NC_customers_invoice_header(@invoice_uq)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const uq = req.nextUrl.searchParams.get("uq") ?? "";
        if (!uq) return NextResponse.json({ error: "uq required" }, { status: 400 });
        const r = await executeProcedure("sp_NC_customers_invoice_header", { invoice_uq: uq });
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
