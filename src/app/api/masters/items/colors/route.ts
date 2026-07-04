import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

export async function GET() {
    try {
        const r = await executeProcedure("sp_flower_colors_list", {});
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_NC_colors_insert", {
            lccolor:    b.color    || "",
            lccolor_sh: b.color_sh || "",
            lldisplay:  b.display  ? 1 : 0,
            llmix:      b.mix      ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Insert", "flower_varieties_colors", row?.unico ?? "", b.color).catch(() => {});
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
