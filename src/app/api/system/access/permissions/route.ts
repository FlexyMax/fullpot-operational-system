import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_sistema_usuarios_accesos_detalle",
            { lcuser_uq: unico }, true);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { rows, targetUq }: { rows: any[], targetUq?: string } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0)
        return NextResponse.json({ error: "rows array required" }, { status: 400 });
    const session = await getServerSession(authOptions);
    const operatorUq = String((session?.user as any)?.id ?? "").padEnd(8).substring(0, 8);
    try {
        const result = await executeProcedure("sp_NC_accesos_update_batch", {
            lcjson: JSON.stringify(rows.map(r => ({
                unico:     r.unico,
                acceso:    r.acceso    ? 1 : 0,
                crear:     r.crear     ? 1 : 0,
                editar:    r.editar    ? 1 : 0,
                borrar:    r.borrar    ? 1 : 0,
                consultar: r.consultar ? 1 : 0,
                reportes:  r.reportes  ? 1 : 0,
            }))),
            lcOperator_uq: operatorUq,
            lcTarget_uq:   String(targetUq ?? "").padEnd(8).substring(0, 8),
        }, true);
        const row = (result.recordset as any[])[0];
        return NextResponse.json({ success: true, updated: row?.updated ?? rows.length });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
