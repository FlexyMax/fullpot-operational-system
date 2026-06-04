import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/invoices?date=YYYY-MM-DD&salesman_uq=XXX
// sp_NC_POS_invoice_list_by_salesman_date(@lcSalesman_uq, @ldInvoice_date)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const date       = req.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];
        const salesmanUq = req.nextUrl.searchParams.get("salesman_uq") || "%";
        const r = await executeProcedure("sp_NC_POS_invoice_list_by_salesman_date", {
            lcSalesman_uq:  salesmanUq,
            ldInvoice_date: new Date(date),
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
