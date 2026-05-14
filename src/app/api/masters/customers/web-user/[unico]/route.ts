import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        await executeQuery(`
            UPDATE flower_customers_users SET
                fname='${txt(b.fname)}',lname='${txt(b.lname)}',username='${txt(b.username)}',
                password='${txt(b.password)}',makeinvoice=${bit(b.makeinvoice)},
                makeprebook=${bit(b.makeprebook)},makecredit=${bit(b.makecredit)},
                viewaccount=${bit(b.viewaccount)},viewproducts=${bit(b.viewproducts)},
                viewhistory=${bit(b.viewhistory)},active=${bit(b.active)},
                email='${txt(b.email)}',phone='${txt(b.phone)}'
            WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Web user updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        await executeQuery(`DELETE FROM flower_customers_users WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Web user deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
