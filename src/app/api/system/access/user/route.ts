import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const result = await executeQuery(
            `SELECT unico, username, nivel, clave, nombres, apellidos, cargo,
                    activo, correo, usuario, image
             FROM usuarios WHERE unico = '${unico.replace(/'/g, "''")}'`,
            true
        );
        return NextResponse.json(result.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
