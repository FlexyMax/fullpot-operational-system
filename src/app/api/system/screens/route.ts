import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const bit = (v: any) => (v ? 1 : 0);

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    const { modulo_uq, nombre, orden, run_pantalla, executable, image, path, menu, web_form, descripcion } = await req.json();
    try {
        const r = await executeProcedure("sp_sistema_pantallas_insert", {
            lcUnico:        "",
            lcModulo_uq:    modulo_uq,
            lcNombre:       nombre,
            lnOrden:        parseInt(orden) || 0,
            lcRun_pantalla: run_pantalla,
            lcImage:        image,
            lcPath:         path,
            llMenu:         bit(menu),
            lcExecutable:   executable,
            lcWeb_form:     web_form,
            lcDescripcion:  descripcion,
            lcOperator_uq:  operatorUq,
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        return NextResponse.json({ success: true, unico: String(row.unico || "").trim(), message: row.message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
