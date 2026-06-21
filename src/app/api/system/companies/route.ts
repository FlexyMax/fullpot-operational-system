import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";
import crypto from "crypto";

const txt   = (v: any) => String(v ?? "").replace(/'/g, "''");
const bToN  = (v: any) => (v ? 1 : 0);

// sp_NC_empresas_lista returns columns in mixed case as written in its SELECT
// (UNICO, NOMBRE, RUC, BASEDATOS, dsn, pais, email, ciudad, telefono1, telefono2, active) —
// remap to the lowercase field names the rest of this page already expects.
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
    const b = await req.json();
    try {
        const sql = `
            EXEC sp_sistema_empresas_insert
                @lcUnico = '',
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
                @llActive = ${bToN(b.active)},
                @lcWebsite = '${txt(b.website)}'
        `;
        const r = await executeQuery(sql, true);
        const res = r.recordset?.[0] || {};
        if (res.Error) return NextResponse.json({ success: false, error: res.Error });
        
        return NextResponse.json({ success: true, unico: res.Unico, message: res.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
