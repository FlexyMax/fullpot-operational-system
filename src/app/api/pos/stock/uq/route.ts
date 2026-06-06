import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/stock/uq?stock_uq=XXXXXXXX
// sp_inventory_stock_uq(@lcstock_uq)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const stockUq = req.nextUrl.searchParams.get("stock_uq") ?? "";
        if (!stockUq) return NextResponse.json({ error: "stock_uq required" }, { status: 400 });
        const r = await executeProcedure("sp_inventory_stock_uq", { lcstock_uq: stockUq });
        const row = r.recordset?.[0] ?? null;
        return NextResponse.json({ row });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
