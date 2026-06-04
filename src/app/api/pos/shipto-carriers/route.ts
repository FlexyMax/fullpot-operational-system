import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/shipto-carriers?customer_uq=XXX&shipto_uq=XXX
// sp_flower_customer_carriers(@customer_uq, @shipto_uq)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const customerUq = req.nextUrl.searchParams.get("customer_uq") ?? "";
        const shiptoUq   = req.nextUrl.searchParams.get("shipto_uq")   ?? "";
        const r = await executeProcedure("sp_flower_customer_carriers", {
            customer_uq: customerUq,
            shipto_uq:   shiptoUq,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
