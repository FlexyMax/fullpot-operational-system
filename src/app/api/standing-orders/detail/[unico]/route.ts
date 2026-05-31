import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";
import sql from "mssql";

type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const [headerResult, linesResult] = await Promise.all([
            executeProcedure("sp_flower_standing_order_uq",    { lcso_uq:     unico }),
            executeProcedure("sp_flower_sales_orders_details", { lcsorder_uq: unico }),
        ]);
        const headerRow = headerResult.recordset?.[0] ?? null;

        // Augment header with UQ fields the SP doesn't return
        let uqFields: Record<string, any> = {};
        if (headerRow) {
            const { getFullpotPool } = await import("@/lib/db");
            const pool = await getFullpotPool();
            const req = pool.request();
            req.input("unico", sql.VarChar, unico);
            const uqResult = await req.query(
                `SELECT whouse_uq, cargo_uq, carrier_uq, shipto_uq
                 FROM flower_sales_orders WHERE unico = @unico`
            );
            uqFields = uqResult.recordset?.[0] ?? {};
        }

        return NextResponse.json({
            header: headerRow ? { ...headerRow, ...uqFields } : null,
            lines:  linesResult.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
