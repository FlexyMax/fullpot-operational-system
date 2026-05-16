import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";
import crypto from "crypto";

// Grades CRUD uses sp_flower_grades_list for reading, direct SQL for write
// (sp_flower_grade_insert/update/delete do not exist in FULLPOT DB as of 2026-05-16)
const txt   = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit   = (v: any) => (v ? 1 : 0);
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

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
    const unico = genUq();
    try {
        await executeQuery(`
            INSERT INTO flower_clases_grados (unico, class_uq, grado, grade_sh, display, timestamp)
            VALUES ('${txt(unico)}', '${txt(b.class_uq || "")}', '${txt(b.grado)}',
                    '${txt(b.grade_sh)}', ${bit(b.display)}, GETDATE())`);
        return NextResponse.json({ success: true, unico, message: "Grade created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
