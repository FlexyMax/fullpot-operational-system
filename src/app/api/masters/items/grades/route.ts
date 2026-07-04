import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "%";
    const param  = search.includes("%") ? search : `%${search}%`;
    try {
        const r = await executeProcedure("sp_flower_grades_list", { lcgrade: param });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_NC_grades_insert", {
            lcgrado:     b.grado     || "",
            lcgrade_sh:  b.grade_sh  || "",
            lldisplay:   b.display   ? 1 : 0,
            llfnational: b.fnational ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Insert", "flower_products_grades", row?.unico ?? "", b.grado).catch(() => {});
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
