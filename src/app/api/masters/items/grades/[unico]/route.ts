import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

type P = { params: Promise<{ unico: string }> };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_NC_grades_update", {
            lcunico:     unico,
            lcgrado:     b.grado     || "",
            lcgrade_sh:  b.grade_sh  || "",
            lldisplay:   b.display   ? 1 : 0,
            llfnational: b.fnational ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Edit", "flower_products_grades", unico, b.grado).catch(() => {});
        return NextResponse.json({ success: true, message: row?.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_NC_grades_delete", { lcunico: unico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Delete", "flower_products_grades", unico, "").catch(() => {});
        return NextResponse.json({ success: true, message: row?.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
