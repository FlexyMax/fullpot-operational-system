import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { executeProcedure, executeQuery } from "@/lib/db";

let _empresaUq: string | null = null;
async function getEmpresaUq(): Promise<string> {
    if (_empresaUq) return _empresaUq;
    try {
        const r = await executeQuery("SELECT TOP 1 unico FROM empresas ORDER BY unico", true);
        _empresaUq = String(r.recordset[0]?.unico ?? "").trim().padEnd(8).substring(0, 8);
        return _empresaUq;
    } catch { return "        "; }
}

/**
 * Call after every successful CRUD operation in an API route.
 * Fire-and-forget — never throws. Inserts into sistema.bitacora via sp_sistema_bitacora_insert.
 *
 * Usage:
 *   serverAuditLog("XD6Z7067", "Insert", "flower_accounts_pay", row.unico).catch(() => {});
 */
export async function serverAuditLog(
    panta_uq:  string,
    accion:    "Insert" | "Edit" | "Delete",
    tabla:     string,
    registro:  string,
    ext_accion = "N/A"
): Promise<void> {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return;
        const user_uq    = String((session.user as any).id ?? "").padEnd(8).substring(0, 8);
        const empresa_uq = await getEmpresaUq();
        await executeProcedure("sp_sistema_bitacora_insert", {
            user_uq,
            empresa_uq,
            panta_uq:   String(panta_uq).padEnd(8).substring(0, 8),
            accion:     String(accion).padEnd(10).substring(0, 10),
            tabla:      String(tabla).substring(0, 50),
            registro:   String(registro).padEnd(8).substring(0, 8),
            ext_accion: String(ext_accion).substring(0, 100),
        }, true);
    } catch (e: any) {
        console.warn("[serverAudit]", e.message);
    }
}
