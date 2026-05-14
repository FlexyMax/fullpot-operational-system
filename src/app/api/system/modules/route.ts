import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
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
    const unico = genUq();
    const { nombre, clase, orden, image, descripcion, dsn, active, web } = body;
    try {
        await executeQuery(`
            INSERT INTO modulo (unico, nombre, clase, orden, image, descripcion, dsn, active, web, timestamp)
            VALUES ('${txt(unico)}','${txt(nombre)}','${txt(clase)}',
                    ${parseInt(orden)||0},'${txt(image)}','${txt(descripcion)}',
                    '${txt(dsn)}',${bit(active)},${bit(web)},GETDATE())`, true);
        return NextResponse.json({ success: true, unico, message: "Module created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
