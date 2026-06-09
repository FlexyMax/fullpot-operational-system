import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(
            `SELECT unico, ruc, nombre, pais, ciudad, direccion, telefono1, telefono2,
                    fax1, fax2, apostal, email, image, basedatos, datapath,
                    servidor, dsn, active, website
             FROM empresas WHERE unico = '${txt(unico)}'`,
            true
        );
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const sql = `
            EXEC sp_sistema_empresas_update
                @lcUnico = '${txt(unico)}',
                @lcRuc = '${txt(b.ruc)}',
                @lcNombre = '${txt(b.nombre)}',
                @lcPais = '${txt(b.pais)}',
                @lcCiudad = '${txt(b.ciudad)}',
                @lcDireccion = '${txt(b.direccion)}',
                @lcTelefono1 = '${txt(b.telefono1)}',
                @lcTelefono2 = '${txt(b.telefono2)}',
                @lcFax1 = '${txt(b.fax1)}',
                @lcFax2 = '${txt(b.fax2)}',
                @lcApostal = '${txt(b.apostal)}',
                @lcEmail = '${txt(b.email)}',
                @lcImage = '${txt(b.image)}',
                @lcBasedatos = '${txt(b.basedatos)}',
                @lcDatapath = '${txt(b.datapath)}',
                @lcServidor = '${txt(b.servidor)}',
                @lcDsn = '${txt(b.dsn)}',
                @llActive = ${bit(b.active)},
                @lcWebsite = '${txt(b.website)}'
        `;
        const r = await executeQuery(sql, true);
        const res = r.recordset?.[0] || {};
        if (res.Error) return NextResponse.json({ success: false, error: res.Error });
        return NextResponse.json({ success: true, message: res.Message || "Company updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const sql = `EXEC sp_sistema_empresas_delete @lcUnico = '${txt(unico)}'`;
        const r = await executeQuery(sql, true);
        const res = r.recordset?.[0] || {};
        if (res.Error) return NextResponse.json({ success: false, error: res.Error });
        return NextResponse.json({ success: true, message: res.Message || "Company deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
