import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// Returns fields matching the exact format of sp_NC_log_by_record_ID:
// Event, Event_Date, Ext_Event, UserName, App_Table
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const txt = (v: string) => String(v ?? "").replace(/'/g, "''");
    try {
        const result = await executeQuery(`
            SELECT
                LTRIM(RTRIM(uv.accion))                                     AS Event,
                CONVERT(varchar(19), uv.fecha, 111)
                    + ' ' + CONVERT(varchar(8), uv.fecha, 108)              AS Event_Date,
                LTRIM(RTRIM(ISNULL(uv.ext_accion, '')))                     AS Ext_Event,
                LTRIM(RTRIM(ISNULL(u.nombres, '') + ' ' + ISNULL(u.apellidos, ''))) AS UserName,
                LTRIM(RTRIM(ISNULL(uv.tabla, '')))                          AS App_Table
            FROM usuarios_vitacora uv
            LEFT JOIN usuarios u ON uv.user_uq = u.unico
            WHERE uv.registro = '${txt(id)}'
            ORDER BY uv.fecha DESC
        `, true);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
