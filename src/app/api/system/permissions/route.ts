/**
 * GET /api/system/permissions?panta_uq=XXXXXXXX
 *
 * Returns the current user's permissions for a specific screen (pantalla).
 * Reads from usuarios_accesos in SISTEMA database.
 *
 * Fields returned:
 *   acceso   - can access the screen
 *   crear    - can create/add records
 *   editar   - can edit records
 *   borrar   - can delete records
 *   consultar - can query/view
 *   reportes  - can print/export
 *
 * If no record found (new page not yet registered in pantalla table),
 * returns all permissions as TRUE to prevent accidental lockouts.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { executeQuery } from "@/lib/db";

export async function GET(req: NextRequest) {
    const panta_uq = req.nextUrl.searchParams.get("panta_uq");

    if (!panta_uq) {
        // No pantalla specified — return full access (e.g. during development)
        return NextResponse.json({
            acceso: true, crear: true, editar: true,
            borrar: true, consultar: true, reportes: true,
            source: "no_panta_uq",
        });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user_uq = (session.user as any).id;
        if (!user_uq) {
            return NextResponse.json({ error: "No user ID in session" }, { status: 401 });
        }

        const txt = (v: string) => String(v).replace(/'/g, "''");
        const result = await executeQuery(`
            SELECT acceso, crear, editar, borrar, consultar, reportes
            FROM usuarios_accesos
            WHERE user_uq = '${txt(user_uq)}'
              AND panta_uq = '${txt(panta_uq)}'
        `, true);

        if (result.recordset.length === 0) {
            // Page not yet registered in usuarios_accesos for this user.
            // Default to full access to avoid lockouts on new pages.
            return NextResponse.json({
                acceso: true, crear: true, editar: true,
                borrar: true, consultar: true, reportes: true,
                source: "not_found_default_full",
            });
        }

        const perm = result.recordset[0];
        return NextResponse.json({
            acceso:    Boolean(perm.acceso),
            crear:     Boolean(perm.crear),
            editar:    Boolean(perm.editar),
            borrar:    Boolean(perm.borrar),
            consultar: Boolean(perm.consultar),
            reportes:  Boolean(perm.reportes),
            source:    "usuarios_accesos",
        });
    } catch (err: any) {
        // On error, return full access (fail open) to avoid UI lockouts
        console.error("[permissions]", err.message);
        return NextResponse.json({
            acceso: true, crear: true, editar: true,
            borrar: true, consultar: true, reportes: true,
            source: "error_default_full",
            error:  err.message,
        });
    }
}
