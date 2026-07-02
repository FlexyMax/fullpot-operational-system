import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

export async function POST(req: NextRequest) {
    const { unico, nivel } = await req.json();
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        if (String(nivel ?? "").trim().toUpperCase() === "ADMINISTRADOR") {
            await executeProcedure("sp_sistema_accesos_insertar_administrador",
                { lcuser_uq: unico }, true);
        }
        await executeProcedure("sp_sistema_accesos_insertar_otros",
            { lcuser_uq: unico }, true);
        serverAuditLog(PANTA, "Insert", "usuarios_accesos", unico, "Initialize Access").catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
