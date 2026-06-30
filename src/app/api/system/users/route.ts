import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure, getSistemaPool } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    const body = await req.json();
    const unico = genUnico();
    const {
        nombres, apellidos, username, clave, cedula, nivel,
        cargo, correo, image, windows_usuario, windows_password
    } = body;
    try {
        const r = await executeProcedure("sp_NC_user_insert", {
            lcUserName:    txt(username),
            lcFirstName:   txt(nombres),
            lcLastName:    txt(apellidos),
            lcLevel:       txt(nivel),
            lcPassword:    txt(clave),
            lcPosition:    txt(cargo),
            lcemail:       txt(correo),
            lcOperator_uq: operatorUq,
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        
        // The SP likely generates the unique ID. We should get it from the dataset if possible.
        // Assuming the SP returns it as `Unico` or `unico`. If not, we will use the one we generated.
        const returnedUnico = row.unico || row.Unico || unico;

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
