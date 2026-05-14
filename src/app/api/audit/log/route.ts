import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { executeProcedure, executeQuery } from "@/lib/db";

let cachedEmpresaUq: string | null = null;
async function getEmpresaUq(): Promise<string> {
    if (cachedEmpresaUq) return cachedEmpresaUq;
    try {
        const r = await executeQuery("SELECT TOP 1 unico FROM empresas ORDER BY unico", true);
        cachedEmpresaUq = String(r.recordset[0]?.unico ?? "").trim().padEnd(8).substring(0, 8);
        return cachedEmpresaUq;
    } catch { return "        "; }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ ok: false }, { status: 401 });

        const { panta_uq, accion, tabla, registro, ext_accion = "N/A" } = await req.json();
        const user_uq    = String((session.user as any).id ?? "").padEnd(8).substring(0, 8);
        const empresa_uq = await getEmpresaUq();

        // accion must be char(10) — pad to 10
        const accionPadded = String(accion ?? "Edit").padEnd(10).substring(0, 10);

        await executeProcedure("sp_sistema_bitacora_insert", {
            user_uq,
            empresa_uq,
            panta_uq:   String(panta_uq ?? "").padEnd(8).substring(0, 8),
            accion:     accionPadded,
            tabla:      String(tabla ?? "").substring(0, 50),
            registro:   String(registro ?? "").padEnd(8).substring(0, 8),
            ext_accion: String(ext_accion ?? "N/A").substring(0, 100),
        }, true);

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.warn("[audit/log]", e.message);
        return NextResponse.json({ ok: false });
    }
}
