import { NextRequest, NextResponse } from "next/server";
import { getFullpotPool } from "@/lib/db";
import sql from "mssql";

export async function GET(req: NextRequest) {
    const raw    = new URL(req.url).searchParams.get("search") || "";
    const search = raw === "%" || raw === "" ? "%" : `%${raw}%`;
    try {
        const pool = await getFullpotPool();
        const r = await pool.request()
            .input("search", sql.VarChar(200), search)
            .query(`
                SELECT TOP 300
                    p.unico,
                    p.description,
                    p.up_x_case  AS bunches_case,
                    p.up_x_pack  AS units_bunch
                FROM flower_products p
                WHERE EXISTS (
                    SELECT 1 FROM flower_products_composition c
                    WHERE c.product_uq = p.unico
                )
                AND p.description LIKE @search
                ORDER BY p.description
            `);
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
