import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// sp_NC_log_by_record_ID is encrypted (no visible params).
// We query usuarios_vitacora directly — equivalent result.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const txt = (v: string) => String(v ?? "").replace(/'/g, "''");
    try {
        const result = await executeQuery(`
            SELECT
                uv.fecha,
                uv.accion,
                LTRIM(RTRIM(u.nombres + ' ' + u.apellidos)) AS usuario_nombre,
                LTRIM(RTRIM(u.username))                    AS username,
                LTRIM(RTRIM(ISNULL(e.nombre,'')))           AS empresa,
                LTRIM(RTRIM(ISNULL(p.nombre,'')))           AS pantalla,
                LTRIM(RTRIM(ISNULL(m.nombre,'')))           AS modulo,
                uv.tabla,
                uv.ext_accion
            FROM usuarios_vitacora uv
            LEFT JOIN usuarios   u ON uv.user_uq    = u.unico
            LEFT JOIN empresas   e ON uv.empresa_uq = e.unico
            LEFT JOIN pantalla   p ON uv.panta_uq   = p.unico
            LEFT JOIN modulo     m ON p.modulo_uq   = m.unico
            WHERE uv.registro = '${txt(id)}'
            ORDER BY uv.fecha DESC
        `, true);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
