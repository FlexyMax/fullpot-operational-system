import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";
import crypto from "crypto";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_customers_messages", { lccustomer_uq: unico });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const { comments, deadline, user_to } = await req.json();
    const msgUnico = genUq();
    try {
        await executeQuery(`
            INSERT INTO flower_customers_comments (unico, customer_uq, comments, add_date, deadline, user_to, closed)
            VALUES ('${txt(msgUnico)}','${txt(unico)}','${txt(comments)}',
                    GETDATE(),'${txt(deadline || '')}','${txt(user_to || '')}',0)`);
        return NextResponse.json({ success: true, unico: msgUnico, message: "Message added." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
