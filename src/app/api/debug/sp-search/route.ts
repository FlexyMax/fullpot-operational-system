import { NextRequest, NextResponse } from "next/server";
import { getFullpotPool } from "@/lib/db";
import sql from "mssql";

// Temporary debug endpoint — DELETE after use
export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q") ?? "crdb";
    try {
        const pool = await getFullpotPool();
        const result = await pool.request()
            .input("q", sql.NVarChar, `%${q}%`)
            .query(`
                SELECT name, type_desc
                FROM sys.objects
                WHERE type IN ('P','FN','TF','IF')
                  AND name LIKE @q
                ORDER BY name
            `);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
