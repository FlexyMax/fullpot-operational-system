import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";
const txt   = (v: any) => String(v ?? "").trim();
const bit   = (v: any) => (v ? 1 : 0);

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_NC_customers_web_user_insert", {
            lccustomer_uq:  txt(b.customer_uq),
            lcfname:        txt(b.fname),
            lclname:        txt(b.lname),
            lcusername:     txt(b.username),
            lcpassword:     txt(b.password),
            llmakeinvoice:  bit(b.makeinvoice),
            llmakeprebook:  bit(b.makeprebook),
            llmakecredit:   bit(b.makecredit),
            llviewaccount:  bit(b.viewaccount),
            llviewproducts: bit(b.viewproducts),
            llviewhistory:  bit(b.viewhistory),
            llactive:       bit(b.active),
            lcemail:        txt(b.email),
            lcphone:        txt(b.phone),
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Insert", "flower_customers_users", row?.unico ?? "").catch(() => {});
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message || "Web user created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
