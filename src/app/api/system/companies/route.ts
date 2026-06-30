import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const txt = (v: any) => String(v ?? "");
const bit = (v: any) => (v ? 1 : 0);

export async function GET() {
    try {
        const r = await executeProcedure("sp_NC_empresas_lista", { llactive: false }, true);
        const companies = (r.recordset ?? []).map((row: any) => ({
            unico:     row.UNICO,
            ruc:       row.RUC,
            nombre:    row.NOMBRE,
            basedatos: row.BASEDATOS,
            dsn:       row.dsn,
            pais:      row.pais,
            ciudad:    row.ciudad,
            telefono1: row.telefono1,
            email:     row.email,
            active:    row.active,
        }));
        return NextResponse.json(companies);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_sistema_empresas_insert", {
            lcUnico:       "",
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
        return NextResponse.json({ success: true, unico: String(row.unico || "").trim(), message: row.message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
