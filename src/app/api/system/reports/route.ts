import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import crypto from "crypto";

const txt   = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit   = (v: any) => (v ? 1 : 0);
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function POST(req: NextRequest) {
    const body  = await req.json();
    const unico = genUq();
    const { panta_uq, nombre, titulo, path, descripcion,
            fecha_desde, fecha_hasta, numero_desde, numero_hasta,
            actual, comprimido, detallado, exportar } = body;
    try {
        await executeQuery(`
            INSERT INTO pantalla_reportes
                (unico,panta_uq,nombre,titulo,path,descripcion,
                 fecha_desde,fecha_hasta,numero_desde,numero_hasta,
                 actual,comprimido,detallado,exportar,timestamp)
            VALUES('${txt(unico)}','${txt(panta_uq)}','${txt(nombre)}','${txt(titulo)}',
                   '${txt(path)}','${txt(descripcion)}',
                   ${bit(fecha_desde)},${bit(fecha_hasta)},${bit(numero_desde)},${bit(numero_hasta)},
                   ${bit(actual)},${bit(comprimido)},${bit(detallado)},${bit(exportar)},GETDATE())`, true);
        return NextResponse.json({ success: true, unico, message: "Report created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
