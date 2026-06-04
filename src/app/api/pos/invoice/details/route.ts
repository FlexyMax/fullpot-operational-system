import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/invoice/details?uq=XXX&salesman_uq=XXX
// sp_NC_invoice_details(@lcinvoice_uq, @lcsalesman_uq)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const uq          = req.nextUrl.searchParams.get("uq") ?? "";
        const salesmanUq  = req.nextUrl.searchParams.get("salesman_uq") || "%";
        if (!uq) return NextResponse.json({ error: "uq required" }, { status: 400 });
        const r = await executeProcedure("sp_NC_invoice_details", {
            lcinvoice_uq:  uq,
            lcsalesman_uq: salesmanUq,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
