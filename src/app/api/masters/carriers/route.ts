import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import crypto from "crypto";

const txt   = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit   = (v: any) => (v ? 1 : 0);
const num   = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function GET() {
    try {
        const r = await executeQuery(
            "SELECT unico, carrier, carriercode, active, contact, phone_1, fax_1, city, country, isairline FROM flower_carriers ORDER BY carrier"
        );
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
            INSERT INTO flower_carriers
                (unico, carriercode, carrier, contact, address, city, state, zip, country,
                 phone_1, phone_2, fax_1, fax_2, email, ship_account, cut_off,
                 product_uq, freight_charge, twf_id, send_twf, username, password,
                 isairline, chk_account, chk_zone, lenght_acc, barcode, cfs_code,
                 internal_delivery, active, timestamp)
            VALUES (
                '${txt(unico)}', '${txt(b.carriercode)}', '${txt(b.carrier)}',
                '${txt(b.contact)}', '${txt(b.address)}', '${txt(b.city)}',
                '${txt(b.state)}', '${txt(b.zip)}', '${txt(b.country)}',
                '${txt(b.phone_1)}', '${txt(b.phone_2)}', '${txt(b.fax_1)}', '${txt(b.fax_2)}',
                '${txt(b.email)}', '${txt(b.ship_account)}',
                ${b.cut_off ? `'${txt(b.cut_off)}'` : 'NULL'},
                ${b.product_uq ? `'${txt(b.product_uq)}'` : 'NULL'},
                ${num(b.freight_charge)},
                '${txt(b.twf_id)}', ${bit(b.send_twf)},
                '${txt(b.username)}', '${txt(b.password)}',
                ${bit(b.isairline)}, ${bit(b.chk_account)}, ${bit(b.chk_zone)},
                '${txt(b.lenght_acc)}', '${txt(b.barcode)}', '${txt(b.cfs_code)}',
                ${bit(b.internal_delivery)}, 1, GETDATE()
            )`);
        return NextResponse.json({ success: true, unico, message: "Carrier created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
