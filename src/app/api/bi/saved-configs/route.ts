import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";

const t = (v: unknown) => String(v ?? "").trim();

const postSchema = z.object({
    report_uq:   z.string().min(1).max(8),
    name:        z.string().min(1).max(100),
    config_json: z.string().min(1),
});

function userUq(session: Session | null): string {
    return String((session?.user as { id?: string } | undefined)?.id ?? "").padEnd(8).substring(0, 8);
}

// GET /api/bi/saved-configs?report_uq=...
// Lists saved BI configurations for the current user, optionally filtered by report.
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const reportUq = t(searchParams.get("report_uq"));

    try {
        const r = await executeProcedure("sp_NC_bi_configs_list", {
            lcuser_uq: userUq(session),
            lcreport_uq: reportUq || null,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST /api/bi/saved-configs
// Creates a new saved BI configuration for the current user.
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = postSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Validate that config_json is valid JSON.
    try { JSON.parse(parsed.data.config_json); } catch {
        return NextResponse.json({ error: "config_json must be valid JSON" }, { status: 400 });
    }

    try {
        const r = await executeProcedure("sp_NC_bi_configs_insert", {
            lcuser_uq:     userUq(session),
            lcreport_uq:   parsed.data.report_uq,
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
