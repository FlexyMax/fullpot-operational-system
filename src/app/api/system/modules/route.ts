import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";
import crypto from "crypto";

const txt    = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit    = (v: any) => (v ? 1 : 0);
const genUq  = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function GET() {
    try {
        const result = await executeQuery(`
            SELECT m.unico, m.clase, m.orden, m.nombre, m.descripcion,
                   m.image, m.dsn, m.active, m.web,
                   COUNT(p.unico) AS screen_count
            FROM modulo m
            LEFT JOIN pantalla p ON p.modulo_uq = m.unico
            GROUP BY m.unico, m.clase, m.orden, m.nombre, m.descripcion,
                     m.image, m.dsn, m.active, m.web
            ORDER BY m.orden, m.nombre`, true);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { nombre, clase, orden, image, descripcion, dsn, active, web } = body;
    try {
        const result = await executeProcedure("sp_sistema_modulos_insert", {
            lcUnico: "",
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
        return NextResponse.json({ success: true, unico: row.Unico, message: row.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
