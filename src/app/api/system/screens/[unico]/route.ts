import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(`SELECT * FROM pantalla WHERE unico='${txt(unico)}'`, true);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const { nombre, orden, run_pantalla, executable, image, path, menu, web_form, descripcion, modulo_uq } = await req.json();
    try {
        const result = await executeProcedure("sp_sistema_pantallas_update", {
            lcUnico: unico,
            lcModulo_uq: modulo_uq,
            lcNombre: nombre,
            lnOrden: parseInt(orden) || 0,
            lcRun_pantalla: run_pantalla,
            lcImage: image,
            lcPath: path,
            llMenu: bit(menu),
            lcExecutable: executable,
            lcWeb_form: web_form,
            lcDescripcion: descripcion
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
        const result = await executeProcedure("sp_sistema_pantallas_delete", { lcUnico: unico }, true);
        const row = result.recordset[0];
        if (row.Error) return NextResponse.json({ success: false, error: row.Error }, { status: 400 });
        return NextResponse.json({ success: true, message: row.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
