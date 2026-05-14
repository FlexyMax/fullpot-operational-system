import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(`SELECT * FROM modulo WHERE unico='${txt(unico)}'`, true);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const { nombre, clase, orden, image, descripcion, dsn, active, web } = await req.json();
    try {
        await executeQuery(`
            UPDATE modulo SET nombre='${txt(nombre)}',clase='${txt(clase)}',
                orden=${parseInt(orden)||0},image='${txt(image)}',descripcion='${txt(descripcion)}',
                dsn='${txt(dsn)}',active=${bit(active)},web=${bit(web)}
            WHERE unico='${txt(unico)}'`, true);
        return NextResponse.json({ success: true, message: "Module updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const chk = await executeQuery(`SELECT COUNT(*) AS total FROM pantalla WHERE modulo_uq='${txt(unico)}'`, true);
        const total = chk.recordset[0]?.total ?? 0;
        if (total > 0) return NextResponse.json({ success: false, error: `There are ${total} screens in this module. Remove them first.` }, { status: 400 });
        await executeQuery(`DELETE FROM modulo WHERE unico='${txt(unico)}'`, true);
        return NextResponse.json({ success: true, message: "Module deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
