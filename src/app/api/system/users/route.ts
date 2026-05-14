import { NextRequest, NextResponse } from "next/server";
import { executeQuery, getSistemaPool } from "@/lib/db";
import crypto from "crypto";
import sql from "mssql";

const txt  = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit  = (v: any) => (v ? 1 : 0);
const genUnico = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function GET() {
    try {
        const result = await executeQuery(
            `SELECT unico, username, nivel, clave, cedula, nombres, apellidos,
                    image, cargo, activo, correo, usuario,
                    windows_usuario, windows_password
             FROM usuarios ORDER BY apellidos, nombres`,
            true
        );
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const unico = genUnico();
    const {
        nombres, apellidos, username, clave, cedula, nivel,
        cargo, correo, image, windows_usuario, windows_password
    } = body;
    try {
        await executeQuery(`
            INSERT INTO usuarios (unico, nombres, apellidos, username, clave, cedula, nivel,
                cargo, correo, image, activo, windows_usuario, windows_password, timestamp)
            VALUES (
                '${txt(unico)}', '${txt(nombres)}', '${txt(apellidos)}',
                '${txt(username)}', '${txt(clave)}', '${txt(cedula)}',
                '${txt(nivel)}', '${txt(cargo)}', '${txt(correo)}',
                '${txt(image)}', 1,
                '${txt(windows_usuario)}', '${txt(windows_password)}', GETDATE()
            )`, true);

        // Insert placeholder photo record
        const photoUnico = genUnico();
        await executeQuery(`
            INSERT INTO usuarios_fotos (unico, user_uq, timestamp)
            VALUES ('${txt(photoUnico)}', '${txt(unico)}', GETDATE())
        `, true);

        return NextResponse.json({ success: true, unico, message: "User created successfully." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
