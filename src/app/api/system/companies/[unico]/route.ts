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
        await executeQuery(`
            UPDATE empresas SET
                ruc        = '${txt(b.ruc)}',
                nombre     = '${txt(b.nombre)}',
                pais       = '${txt(b.pais)}',
                ciudad     = '${txt(b.ciudad)}',
                direccion  = '${txt(b.direccion)}',
                telefono1  = '${txt(b.telefono1)}',
                telefono2  = '${txt(b.telefono2)}',
                fax1       = '${txt(b.fax1)}',
                fax2       = '${txt(b.fax2)}',
                apostal    = '${txt(b.apostal)}',
                email      = '${txt(b.email)}',
                image      = '${txt(b.image)}',
                basedatos  = '${txt(b.basedatos)}',
                datapath   = '${txt(b.datapath)}',
                servidor   = '${txt(b.servidor)}',
                dsn        = '${txt(b.dsn)}',
                active     = ${bit(b.active)},
                website    = '${txt(b.website)}'
            WHERE unico = '${txt(unico)}'`, true);
        return NextResponse.json({ success: true, message: "Company updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: "Instruction isn't enabled. / Instrucción no disponible." },
        { status: 400 }
    );
}
