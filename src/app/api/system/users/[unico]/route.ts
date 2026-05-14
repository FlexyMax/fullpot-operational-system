import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const result = await executeQuery(
            `SELECT unico, username, nivel, clave, cedula, nombres, apellidos,
                    image, cargo, activo, correo, usuario,
                    windows_usuario, windows_password
             FROM usuarios WHERE unico = '${txt(unico)}'`,
            true
        );
        return NextResponse.json(result.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const body = await req.json();
    const { nombres, apellidos, username, clave, cedula, nivel,
            cargo, correo, image, activo, windows_usuario, windows_password } = body;
    try {
        await executeQuery(`
            UPDATE usuarios SET
                nombres           = '${txt(nombres)}',
                apellidos         = '${txt(apellidos)}',
                username          = '${txt(username)}',
                clave             = '${txt(clave)}',
                cedula            = '${txt(cedula)}',
                nivel             = '${txt(nivel)}',
                cargo             = '${txt(cargo)}',
                correo            = '${txt(correo)}',
                image             = '${txt(image)}',
                activo            = ${bit(activo)},
                windows_usuario   = '${txt(windows_usuario)}',
                windows_password  = '${txt(windows_password)}'
            WHERE unico = '${txt(unico)}'`, true);

        return NextResponse.json({ success: true, message: "User updated successfully." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const check = await executeQuery(
            `SELECT COUNT(*) AS total FROM usuarios_vitacora WHERE user_uq = '${txt(unico)}'`, true);
        const total = check.recordset[0]?.total ?? 0;
        if (total > 0) {
            return NextResponse.json({
                success: false,
                error: `There are ${total} activity log records for this user. Cannot delete this record.`
            }, { status: 400 });
        }
        await executeQuery(`DELETE FROM usuarios_fotos WHERE user_uq = '${txt(unico)}'`, true);
        await executeQuery(`DELETE FROM usuarios WHERE unico = '${txt(unico)}'`, true);
        return NextResponse.json({ success: true, message: "User deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
