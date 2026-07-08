import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";
const txt   = (v: any) => String(v ?? "").trim();
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_customers_messages", { lccustomer_uq: unico });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const { comments, deadline, user_to } = await req.json();
    try {
        const r = await executeProcedure("sp_NC_customers_message_insert", {
            lccustomer_uq: unico,
            lccomments:    txt(comments),
            lcdeadline:    txt(deadline),
            lcuser_to:     txt(user_to),
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Insert", "flower_customers_comments", row?.unico ?? "").catch(() => {});
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message || "Message added." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_NC_customers_message_delete", { lcunico: unico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Delete", "flower_customers_comments", unico).catch(() => {});
        return NextResponse.json({ success: true, message: row?.Message || "Message deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
