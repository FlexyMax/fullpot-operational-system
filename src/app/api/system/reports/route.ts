import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const bit = (v: any) => (v ? 1 : 0);

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    const { panta_uq, nombre, titulo, path, descripcion,
            fecha_desde, fecha_hasta, numero_desde, numero_hasta,
            actual, comprimido, detallado, exportar } = await req.json();
    try {
        const r = await executeProcedure("sp_sistema_reportes_insert", {
            lcUnico:        "",
            lcPanta_uq:     panta_uq,
            lcNombre:       nombre,
            lcTitulo:       titulo,
            lcPath:         path,
            lcDescripcion:  descripcion,
            llFecha_desde:  bit(fecha_desde),
            llFecha_hasta:  bit(fecha_hasta),
            llNumero_desde: bit(numero_desde),
            llNumero_hasta: bit(numero_hasta),
            llActual:       bit(actual),
            llComprimido:   bit(comprimido),
            llDetallado:    bit(detallado),
            llExportar:     bit(exportar),
            lcOperator_uq:  operatorUq,
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        return NextResponse.json({ success: true, unico: String(row.unico || "").trim(), message: row.message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
