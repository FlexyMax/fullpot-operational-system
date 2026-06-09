import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const { panta_uq, nombre, titulo, path, descripcion,
            fecha_desde, fecha_hasta, numero_desde, numero_hasta,
            actual, comprimido, detallado, exportar } = await req.json();
    try {
        const result = await executeProcedure("sp_sistema_reportes_update", {
            lcUnico: unico,
            lcPanta_uq: panta_uq,
            lcNombre: nombre,
            lcTitulo: titulo,
            lcPath: path,
            lcDescripcion: descripcion,
            llFecha_desde: bit(fecha_desde),
            llFecha_hasta: bit(fecha_hasta),
            llNumero_desde: bit(numero_desde),
            llNumero_hasta: bit(numero_hasta),
            llActual: bit(actual),
            llComprimido: bit(comprimido),
            llDetallado: bit(detallado),
            llExportar: bit(exportar)
        }, true);
        const row = result.recordset[0];
        if (row.Error) throw new Error(row.Error);
        return NextResponse.json({ success: true, message: row.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const result = await executeProcedure("sp_sistema_reportes_delete", { lcUnico: unico }, true);
        const row = result.recordset[0];
        if (row.Error) return NextResponse.json({ success: false, error: row.Error }, { status: 400 });
        return NextResponse.json({ success: true, message: row.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
