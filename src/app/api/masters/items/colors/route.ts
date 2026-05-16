import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";
import crypto from "crypto";

// sp_flower_colors_list has NO params — returns all colors. Filter client-side.
// Color CRUD SPs don't exist → direct SQL on flower_varieties_colors
const txt   = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit   = (v: any) => (v ? 1 : 0);
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

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
    const unico = genUq();
    try {
        await executeQuery(`
            INSERT INTO flower_varieties_colors (unico, color, color_sh, display, mix, timestamp)
            VALUES ('${txt(unico)}', '${txt(b.color)}', '${txt(b.color_sh)}',
                    ${bit(b.display)}, ${bit(b.mix)}, GETDATE())`);
        return NextResponse.json({ success: true, unico, message: "Color created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
