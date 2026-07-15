import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";

const t = (v: unknown) => String(v ?? "").trim();

type P = { params: Promise<{ unico: string }> };

const putSchema = z.object({
    name:        z.string().min(1).max(100),
    config_json: z.string().min(1),
});

function userUq(session: Session | null): string {
    return String((session?.user as { id?: string } | undefined)?.id ?? "").padEnd(8).substring(0, 8);
}

// PUT /api/bi/saved-configs/:unico
// Updates a saved BI configuration. Ownership is enforced by the stored procedure.
export async function PUT(req: NextRequest, { params }: P) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { unico } = await params;
    const parsed = putSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    try { JSON.parse(parsed.data.config_json); } catch {
        return NextResponse.json({ error: "config_json must be valid JSON" }, { status: 400 });
    }

    try {
        const r = await executeProcedure("sp_NC_bi_configs_update", {
            lcunico:       t(unico),
            lcuser_uq:     userUq(session),
            lcname:        parsed.data.name,
            lcconfig_json: parsed.data.config_json,
        });
        const row = r.recordset?.[0] || {};
        if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        return NextResponse.json({ success: true, unico: t(row.unico), message: row.message });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// DELETE /api/bi/saved-configs/:unico
// Deletes a saved BI configuration. Ownership is enforced by the stored procedure.
export async function DELETE(_req: NextRequest, { params }: P) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { unico } = await params;

    try {
        const r = await executeProcedure("sp_NC_bi_configs_delete", {
            lcunico:   t(unico),
            lcuser_uq: userUq(session),
        });
        const row = r.recordset?.[0] || {};
        if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        return NextResponse.json({ success: true, unico: t(row.unico), message: row.message });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
