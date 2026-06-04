import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/pos/invoice/open { uq, salesman_uq }
// sp_flower_invoice_unlock(@lcInvoice_uq, @lcSaleman_uq)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { uq, salesman_uq } = await req.json();
        await executeProcedure("sp_flower_invoice_unlock", {
            lcInvoice_uq: uq,
            lcSaleman_uq: salesman_uq || "",
        });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
