import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const [mod, screens, reports] = await Promise.all([
            executeQuery(`SELECT * FROM modulo WHERE unico='${txt(unico)}'`, true),
            executeQuery(`SELECT * FROM pantalla WHERE modulo_uq='${txt(unico)}' ORDER BY orden`, true),
            executeQuery(`SELECT pr.* FROM pantalla_reportes pr
                          JOIN pantalla p ON pr.panta_uq=p.unico
                          WHERE p.modulo_uq='${txt(unico)}' ORDER BY pr.titulo`, true),
        ]);
        return NextResponse.json({
            module:     mod.recordset[0] ?? null,
            screens:    screens.recordset,
            reports:    reports.recordset,
            exportedAt: new Date().toISOString(),
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
