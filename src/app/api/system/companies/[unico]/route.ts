import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

const txt = (v: any) => String(v ?? "");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_NC_empresa_info", { lcUnico: unico }, true);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_sistema_empresas_update", {
            lcUnico:       unico,
            lcRuc:         txt(b.ruc),
            lcNombre:      txt(b.nombre),
            lcPais:        txt(b.pais),
            lcCiudad:      txt(b.ciudad),
            lcDireccion:   txt(b.direccion),
            lcTelefono1:   txt(b.telefono1),
            lcTelefono2:   txt(b.telefono2),
            lcFax1:        txt(b.fax1),
            lcFax2:        txt(b.fax2),
            lcApostal:     txt(b.apostal),
            lcEmail:       txt(b.email),
            lcImage:       txt(b.image),
            lcBasedatos:   txt(b.basedatos),
            lcDatapath:    txt(b.datapath),
            lcServidor:    txt(b.servidor),
            lcDsn:         txt(b.dsn),
            llActive:      bit(b.active),
            lcWebsite:     txt(b.website),
            lcOperator_uq: operatorUq,
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        serverAuditLog(PANTA, "Edit", "empresas", unico).catch(() => {});
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
        const r = await executeProcedure("sp_sistema_empresas_delete", {
            lcUnico:       unico,
            lcOperator_uq: operatorUq,
        }, true);
        const row = r.recordset?.[0] || {};
        if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        serverAuditLog(PANTA, "Delete", "empresas", unico).catch(() => {});
        return NextResponse.json({ success: true, message: row.message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
