import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/history/invoices?customer_uq=XXX&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&salesman_uq=XXX
// sp_flower_invoice_history(@lccustomer_uq, @ldfrom:datetime, @ldto:datetime, @lcsalesman_uq)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const customerUq  = req.nextUrl.searchParams.get("customer_uq")  || "%";
        const startDate   = req.nextUrl.searchParams.get("start_date")   || "";
        const endDate     = req.nextUrl.searchParams.get("end_date")     || "";
        // Client passes the salesman's unico from sp_flower_salesman_uq
        const salesmanUq  = req.nextUrl.searchParams.get("salesman_uq")  || "%";

        const from = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
        const to   = endDate   ? new Date(endDate)   : new Date();

        const r = await executeProcedure("sp_flower_invoice_history", {
            lccustomer_uq: customerUq,
            ldfrom:        from,
            ldto:          to,
            lcsalesman_uq: salesmanUq,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
