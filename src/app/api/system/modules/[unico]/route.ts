import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(`SELECT * FROM modulo WHERE unico='${txt(unico)}'`, true);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const { nombre, clase, orden, image, descripcion, dsn, active, web } = await req.json();
    try {
        const result = await executeProcedure("sp_sistema_modulos_update", {
            lcUnico: unico,
            lcNombre: nombre,
            lcClase: clase,
            lnOrden: parseInt(orden) || 0,
            lcImage: image,
            lcDescripcion: descripcion,
            llActive: bit(active),
            llWeb: bit(web),
            lcDsn: dsn
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
        const result = await executeProcedure("sp_sistema_modulos_delete", { lcUnico: unico }, true);
        const row = result.recordset[0];
        if (row.Error) return NextResponse.json({ success: false, error: row.Error }, { status: 400 });
        return NextResponse.json({ success: true, message: row.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
