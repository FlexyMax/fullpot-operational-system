import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

export async function GET(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_sistema_usuarios_accesos_detalle",
            { lcuser_uq: unico }, true);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const rows: any[] = await req.json();
    if (!Array.isArray(rows) || rows.length === 0)
        return NextResponse.json({ error: "rows array required" }, { status: 400 });
    const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
    const bit = (v: any) => (v ? 1 : 0);
    try {
        for (const r of rows) {
            await executeQuery(
                `UPDATE usuarios_accesos SET
                    acceso    = ${bit(r.acceso)},
                    crear     = ${bit(r.crear)},
                    editar    = ${bit(r.editar)},
                    borrar    = ${bit(r.borrar)},
                    consultar = ${bit(r.consultar)},
                    reportes  = ${bit(r.reportes)}
                 WHERE unico = '${txt(r.unico)}'`,
                true
            );
        }
        return NextResponse.json({ success: true, updated: rows.length });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
