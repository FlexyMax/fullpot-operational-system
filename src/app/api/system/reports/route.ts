import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";
import crypto from "crypto";

const bit = (v: any) => (v ? 1 : 0);

export async function POST(req: NextRequest) {
    const body  = await req.json();
    const { panta_uq, nombre, titulo, path, descripcion,
            fecha_desde, fecha_hasta, numero_desde, numero_hasta,
            actual, comprimido, detallado, exportar } = body;
    try {
        const result = await executeProcedure("sp_sistema_reportes_insert", {
            lcUnico: "",
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
        return NextResponse.json({ success: true, unico: row.Unico, message: row.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
