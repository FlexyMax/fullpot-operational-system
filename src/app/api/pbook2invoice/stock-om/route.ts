import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const product_uq  = req.nextUrl.searchParams.get("product_uq") || "%";
    const pbook_d_uq  = req.nextUrl.searchParams.get("unico") || "";
    if (!pbook_d_uq) return NextResponse.json([]);
    try {
        // Get salesman unico for current user
        const salProfile = await executeProcedure("sp_flower_salesman_uq", {
            lcunico: "%",
            lcuser_uq: (session as any)?.user?.id ?? "",
        });
        const salesman_uq = salProfile.recordset?.[0]?.unico ?? "%";
        const r = await executeProcedure("sp_flower_packing_stock_without_customer", {
            lcproduct_uq:  product_uq,
            lcpbook_d_uq:  pbook_d_uq,
            lcsalesman_uq: salesman_uq,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
