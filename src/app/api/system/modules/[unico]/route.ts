import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_NC_modulo_info", { lcUnico: unico }, true);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    const { nombre, clase, orden, image, descripcion, dsn, active, web } = await req.json();
    try {
        const r = await executeProcedure("sp_sistema_modulos_update", {
            lcUnico:       unico,
            lcNombre:      nombre,
            lcClase:       clase,
            lnOrden:       parseInt(orden) || 0,
            lcImage:       image,
            lcDescripcion: descripcion,
            llActive:      bit(active),
            llWeb:         bit(web),
            lcDsn:         dsn,
            lcOperator_uq: operatorUq,
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        serverAuditLog(PANTA, "Edit", "sistema_modulos", unico).catch(() => {});
        return NextResponse.json({ success: true, message: row.message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    try {
        const r = await executeProcedure("sp_sistema_modulos_delete", {
            lcUnico:       unico,
            lcOperator_uq: operatorUq,
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        serverAuditLog(PANTA, "Delete", "sistema_modulos", unico).catch(() => {});
        return NextResponse.json({ success: true, message: row.message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
