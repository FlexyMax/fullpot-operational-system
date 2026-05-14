import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET() {
    try {
        const [mods, screens, reports] = await Promise.all([
            executeQuery("SELECT * FROM modulo ORDER BY orden, nombre", true),
            executeQuery("SELECT * FROM pantalla ORDER BY modulo_uq, orden", true),
            executeQuery("SELECT * FROM pantalla_reportes ORDER BY panta_uq, titulo", true),
        ]);
        return NextResponse.json({
            modules:    mods.recordset,
            screens:    screens.recordset,
            reports:    reports.recordset,
            exportedAt: new Date().toISOString(),
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
