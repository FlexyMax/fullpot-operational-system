import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

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
    const body = await req.json();
    const { nombres, apellidos, username, clave, nivel, cargo, correo } = body;
    try {
        const r = await executeProcedure("sp_NC_user_update", {
            lcUnico:     unico,
            lcUserName:  txt(username),
            lcFirstName: txt(nombres),
            lcLastName:  txt(apellidos),
            lcLevel:     txt(nivel),
            lcPassword:  txt(clave),
            lcPosition:  txt(cargo),
            lcemail:     txt(correo)
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });

        return NextResponse.json({ success: true, message: "User updated successfully." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_NC_user_delete", { lcUnico: unico }, true);
        const row = r.recordset?.[0] || {};
        if (row.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });

        return NextResponse.json({ success: true, message: "User deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
