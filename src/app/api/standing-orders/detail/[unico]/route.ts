import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const [headerResult, linesResult] = await Promise.all([
            executeProcedure("sp_flower_standing_order_uq",    { lcso_uq:     unico }),
            executeProcedure("sp_flower_sales_orders_details", { lcsorder_uq: unico }),
        ]);
        return NextResponse.json({
            header: headerResult.recordset?.[0] ?? null,
            lines:  linesResult.recordset        ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
