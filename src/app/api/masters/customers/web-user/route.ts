import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import crypto from "crypto";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function POST(req: NextRequest) {
    const b = await req.json();
    const unico = genUq();
    try {
        await executeQuery(`
            INSERT INTO flower_customers_users
                (unico, customer_uq, fname, lname, username, password, makeinvoice, makeprebook,
                 makecredit, viewaccount, viewproducts, viewhistory, active, email, phone)
            VALUES ('${txt(unico)}','${txt(b.customer_uq)}','${txt(b.fname)}','${txt(b.lname)}',
                    '${txt(b.username)}','${txt(b.password)}',${bit(b.makeinvoice)},${bit(b.makeprebook)},
                    ${bit(b.makecredit)},${bit(b.viewaccount)},${bit(b.viewproducts)},${bit(b.viewhistory)},
                    ${bit(b.active)},'${txt(b.email)}','${txt(b.phone)}')`);
        return NextResponse.json({ success: true, unico, message: "Web user created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
