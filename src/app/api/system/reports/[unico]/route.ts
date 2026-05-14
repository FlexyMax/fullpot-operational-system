import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const { nombre, titulo, path, descripcion,
            fecha_desde, fecha_hasta, numero_desde, numero_hasta,
            actual, comprimido, detallado, exportar } = await req.json();
    try {
        await executeQuery(`
            UPDATE pantalla_reportes SET
                nombre='${txt(nombre)}',titulo='${txt(titulo)}',path='${txt(path)}',
                descripcion='${txt(descripcion)}',fecha_desde=${bit(fecha_desde)},
                fecha_hasta=${bit(fecha_hasta)},numero_desde=${bit(numero_desde)},
                numero_hasta=${bit(numero_hasta)},actual=${bit(actual)},
                comprimido=${bit(comprimido)},detallado=${bit(detallado)},exportar=${bit(exportar)}
            WHERE unico='${txt(unico)}'`, true);
        return NextResponse.json({ success: true, message: "Report updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        await executeQuery(`DELETE FROM pantalla_reportes WHERE unico='${txt(unico)}'`, true);
        return NextResponse.json({ success: true, message: "Report deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
