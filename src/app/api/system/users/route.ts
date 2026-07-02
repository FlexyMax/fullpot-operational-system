import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");

export async function GET() {
    try {
        const result = await executeProcedure("sp_NC_users_list", {}, true);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    const body = await req.json();
    const {
        nombres, apellidos, username, clave, cedula, nivel,
        cargo, correo, windows_usuario, windows_password
    } = body;
    try {
        const r = await executeProcedure("sp_NC_user_insert", {
            lcUserName:        txt(username),
            lcFirstName:       txt(nombres),
            lcLastName:        txt(apellidos),
            lcLevel:           txt(nivel),
            lcPassword:        txt(clave),
            lcPosition:        txt(cargo),
            lcemail:           txt(correo),
            lcOperator_uq:     operatorUq,
            lcCedula:          txt(cedula),
            lcWindowsUser:     txt(windows_usuario),
            lcWindowsPassword: txt(windows_password),
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });

        const returnedUnico = String(row.unico || "").trim();

        // Insert placeholder photo record using the SP-generated unico
        if (returnedUnico) {
            await executeProcedure("sp_NC_user_foto_insert", { lcUserUq: returnedUnico }, true);
        }

        serverAuditLog(PANTA, "Insert", "sistema_usuarios", returnedUnico).catch(() => {});
        return NextResponse.json({ success: true, unico: returnedUnico, message: "User created successfully." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
