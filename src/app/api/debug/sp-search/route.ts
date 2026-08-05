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
                SELECT
                    o.name                          AS sp_name,
                    p.parameter_id                  AS param_order,
                    p.name                          AS param_name,
                    t.name                          AS param_type,
                    p.max_length,
                    p.is_output
                FROM sys.objects o
                LEFT JOIN sys.parameters p ON p.object_id = o.object_id
                LEFT JOIN sys.types t      ON t.user_type_id = p.user_type_id
                WHERE o.type IN ('P','FN','TF','IF')
                  AND o.name LIKE @q
                ORDER BY o.name, p.parameter_id
            `);

        // Group by SP name
        const grouped: Record<string, any[]> = {};
        for (const row of result.recordset) {
            if (!grouped[row.sp_name]) grouped[row.sp_name] = [];
            if (row.param_name) grouped[row.sp_name].push({
                order: row.param_order,
                name:  row.param_name,
                type:  row.param_type,
                len:   row.max_length,
                out:   row.is_output,
            });
        }
        return NextResponse.json(grouped);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
