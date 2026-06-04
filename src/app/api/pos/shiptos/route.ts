import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/shiptos?customer_uq=XXX
// sp_NC_shipto_x_customer(@customer_uq)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const customerUq = req.nextUrl.searchParams.get("customer_uq") ?? "";
        if (!customerUq) return NextResponse.json([], { status: 200 });
        const r = await executeProcedure("sp_NC_shipto_x_customer", { customer_uq: customerUq });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
