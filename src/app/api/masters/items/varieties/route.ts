import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";
import crypto from "crypto";

// Variety CRUD SPs (insert/update/delete) don't exist — use direct SQL
const txt   = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit   = (v: any) => (v ? 1 : 0);
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function GET(req: NextRequest) {
    const subclass_uq = req.nextUrl.searchParams.get("subclass_uq") || "";
    const search      = req.nextUrl.searchParams.get("search") || "%";
    const param       = search.includes("%") ? search : `%${search}%`;
    try {
        const r = await executeProcedure("sp_flower_subclass_varieties", {
            lcsubclass_uq: subclass_uq,
            lcvariety:     param,
        });
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
            INSERT INTO flower_varieties
                (unico, subcla_uq, class_uq, variety, variety_sh, color_uq,
                 display, changecolor, active, timestamp)
            VALUES (
                '${txt(unico)}', '${txt(b.subclass_uq || b.subcla_uq)}',
                '${txt(b.class_uq)}', '${txt(b.variety)}', '${txt(b.variety_sh)}',
                '${txt(b.color_uq)}', ${bit(b.display)}, ${bit(b.changecolor)},
                ${bit(b.active !== false)}, GETDATE()
            )`);
        return NextResponse.json({ success: true, unico, message: "Variety created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
