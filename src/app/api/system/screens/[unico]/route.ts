import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(`SELECT * FROM pantalla WHERE unico='${txt(unico)}'`, true);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const { nombre, orden, run_pantalla, executable, image, path, menu, web_form, descripcion } = await req.json();
    try {
        await executeQuery(`
            UPDATE pantalla SET nombre='${txt(nombre)}',orden=${parseInt(orden)||0},
                run_pantalla='${txt(run_pantalla)}',executable='${txt(executable)}',
                image='${txt(image)}',path='${txt(path)}',menu=${bit(menu)},
                web_form='${txt(web_form)}',descripcion='${txt(descripcion)}'
            WHERE unico='${txt(unico)}'`, true);
        return NextResponse.json({ success: true, message: "Screen updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const chk = await executeQuery(`SELECT COUNT(*) AS total FROM pantalla_reportes WHERE panta_uq='${txt(unico)}'`, true);
        const total = chk.recordset[0]?.total ?? 0;
        if (total > 0) return NextResponse.json({ success: false, error: `There are ${total} related records in the detail. Remove them first.` }, { status: 400 });
        await executeQuery(`DELETE FROM pantalla WHERE unico='${txt(unico)}'`, true);
        return NextResponse.json({ success: true, message: "Screen deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
