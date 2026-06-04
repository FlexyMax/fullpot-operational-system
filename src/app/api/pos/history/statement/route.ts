import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/history/statement?customer_uq=XXX&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
// sp_flower_accounts_rec_statment(@Customer, @ldStart_date, @ldEnd_date)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const customerUq = req.nextUrl.searchParams.get("customer_uq") || "%";
        const startDate  = req.nextUrl.searchParams.get("start_date")  || "";
        const endDate    = req.nextUrl.searchParams.get("end_date")    || "";

        const from = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 86400000);
        const to   = endDate   ? new Date(endDate)   : new Date();

        const r = await executeProcedure("sp_flower_accounts_rec_statment", {
            Customer:      customerUq,
            ldStart_date:  from,
            ldEnd_date:    to,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
