import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";
import crypto from "crypto";

const bit = (v: any) => (v ? 1 : 0);

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { modulo_uq, nombre, orden, run_pantalla, executable, image, path, menu, web_form, descripcion } = body;
    try {
        const result = await executeProcedure("sp_sistema_pantallas_insert", {
            lcUnico: "",
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
        return NextResponse.json({ success: true, unico: row.Unico, message: row.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
