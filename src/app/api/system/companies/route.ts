import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import crypto from "crypto";

const txt   = (v: any) => String(v ?? "").replace(/'/g, "''");
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function GET() {
    try {
        const r = await executeQuery(
            "SELECT unico, nombre, active FROM empresas ORDER BY nombre",
            true
        );
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    const unico = genUq();
    try {
        await executeQuery(`
            INSERT INTO empresas
                (unico, ruc, nombre, pais, ciudad, direccion, telefono1, telefono2,
                 fax1, fax2, apostal, email, image, basedatos, datapath,
                 servidor, dsn, active, website, timestamp)
            VALUES (
                '${txt(unico)}', '${txt(b.ruc)}', '${txt(b.nombre)}',
                '${txt(b.pais)}', '${txt(b.ciudad)}', '${txt(b.direccion)}',
                '${txt(b.telefono1)}', '${txt(b.telefono2)}',
                '${txt(b.fax1)}', '${txt(b.fax2)}', '${txt(b.apostal)}',
                '${txt(b.email)}', '${txt(b.image)}', '${txt(b.basedatos)}',
                '${txt(b.datapath)}', '${txt(b.servidor)}', '${txt(b.dsn)}',
                1, '${txt(b.website)}', GETDATE()
            )`, true);
        return NextResponse.json({ success: true, unico, message: "Company created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
