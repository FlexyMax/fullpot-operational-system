import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const SUPERADMIN = "SUPERADMIN";

/**
 * panta_uq values that only SUPERADMIN can grant access to.
 * "52961702" = Module & Screen Setup (the source-of-truth pantalla for the modules page).
 */
export const SUPERADMIN_ONLY_PANTA = new Set(["52961702"]);

/**
 * Fallback: screen name keywords to catch Company Setup before it gets its own panta_uq.
 * Match is case-insensitive against the `pantalla` label field.
 */
export const SUPERADMIN_PANTA_NAME_RE = /COMPANY\s*SETUP|COMPANIES\s*DEF|EMPRESA/i;

/** Returns true if a permissions row belongs to a SUPERADMIN-only screen. */
export function isSuperAdminOnlyPerm(row: {
    panta_uq?: string;
    pantalla?:  string;
}): boolean {
    if (SUPERADMIN_ONLY_PANTA.has(String(row.panta_uq ?? "").trim())) return true;
    if (SUPERADMIN_PANTA_NAME_RE.test(String(row.pantalla ?? ""))) return true;
    return false;
}

/** Returns the current session nivel (uppercase), or "" if unauthenticated. */
export async function getSessionNivel(): Promise<string> {
    const session = await getServerSession(authOptions);
    return String((session?.user as any)?.nivel ?? "").trim().toUpperCase();
}

/** Returns a 403 NextResponse if caller is not SUPERADMIN, otherwise null. */
export async function requireSuperAdmin(): Promise<NextResponse | null> {
    const nivel = await getSessionNivel();
    if (nivel !== SUPERADMIN) {
        return NextResponse.json(
            { error: "Access denied. Requires SUPERADMIN level." },
            { status: 403 }
        );
    }
    return null;
}
