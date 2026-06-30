import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_NC_User_Info", { lcUser_uq: unico }, true);
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    const body = await req.json();
    const { nombres, apellidos, username, clave, nivel, cargo, correo, cedula, windows_usuario, windows_password, activo } = body;
    try {
        const r = await executeProcedure("sp_NC_user_update", {
            lcUnico:           unico,
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
            lcActivo:          activo === undefined ? null : (activo ? 1 : 0),
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });

        return NextResponse.json({ success: true, message: "User updated successfully." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    try {
        const r = await executeProcedure("sp_NC_user_delete", {
            lcUnico:       unico,
            lcOperator_uq: operatorUq,
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });

        return NextResponse.json({ success: true, message: "User deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
