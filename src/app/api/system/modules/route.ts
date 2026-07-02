import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

const bit = (v: any) => (v ? 1 : 0);

export async function GET() {
    try {
        const r = await executeProcedure("sp_NC_modulos_lista", {}, true);
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    const { nombre, clase, orden, image, descripcion, dsn, active, web } = await req.json();
    try {
        const r = await executeProcedure("sp_sistema_modulos_insert", {
            lcUnico:       "",
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
        const unico = String(row.unico || "").trim();
        serverAuditLog(PANTA, "Insert", "sistema_modulos", unico).catch(() => {});
        return NextResponse.json({ success: true, unico, message: row.message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
