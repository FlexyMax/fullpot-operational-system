import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    const { panta_uq, nombre, titulo, path, descripcion,
            fecha_desde, fecha_hasta, numero_desde, numero_hasta,
            actual, comprimido, detallado, exportar } = await req.json();
    try {
        const r = await executeProcedure("sp_sistema_reportes_update", {
            lcUnico:        unico,
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
        serverAuditLog(PANTA, "Edit", "pantalla_reportes", unico).catch(() => {});
        return NextResponse.json({ success: true, message: row.message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    try {
        const r = await executeProcedure("sp_sistema_reportes_delete", {
            lcUnico:       unico,
            lcOperator_uq: operatorUq,
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        serverAuditLog(PANTA, "Delete", "pantalla_reportes", unico).catch(() => {});
        return NextResponse.json({ success: true, message: row.message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
