import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/authGuards";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const denied = await requireSuperAdmin();
    if (denied) return denied;
    const { unico } = await params;
    try {
        const result = await executeProcedure("sp_sistema_modulos_pantallas", { lcmodulo_uq: unico }, true);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
