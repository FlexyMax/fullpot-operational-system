import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/authGuards";

export async function GET() {
    const denied = await requireSuperAdmin();
    if (denied) return denied;
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
