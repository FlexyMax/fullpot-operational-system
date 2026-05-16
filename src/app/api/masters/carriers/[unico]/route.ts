import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(
            `SELECT unico, active, carrier, carriercode, address, city, state, zip, country,
                    phone_1, phone_2, fax_1, fax_2, email, contact, ship_account, cut_off,
                    product_uq, freight_charge, twf_id, send_twf, username, password,
                    isairline, chk_account, chk_zone, lenght_acc, barcode, cfs_code,
                    internal_delivery
             FROM flower_carriers WHERE unico = '${txt(unico)}'`
        );
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        await executeQuery(`
            UPDATE flower_carriers SET
                carriercode    = '${txt(b.carriercode)}',
                carrier        = '${txt(b.carrier)}',
                contact        = '${txt(b.contact)}',
                address        = '${txt(b.address)}',
                city           = '${txt(b.city)}',
                state          = '${txt(b.state)}',
                zip            = '${txt(b.zip)}',
                country        = '${txt(b.country)}',
                phone_1        = '${txt(b.phone_1)}',
                phone_2        = '${txt(b.phone_2)}',
                fax_1          = '${txt(b.fax_1)}',
                fax_2          = '${txt(b.fax_2)}',
                email          = '${txt(b.email)}',
                ship_account   = '${txt(b.ship_account)}',
                cut_off        = ${b.cut_off ? `'${txt(b.cut_off)}'` : 'NULL'},
                product_uq     = ${b.product_uq ? `'${txt(b.product_uq)}'` : 'NULL'},
                freight_charge = ${num(b.freight_charge)},
                twf_id         = '${txt(b.twf_id)}',
                send_twf       = ${bit(b.send_twf)},
                username       = '${txt(b.username)}',
                password       = '${txt(b.password)}',
                isairline      = ${bit(b.isairline)},
                chk_account    = ${bit(b.chk_account)},
                chk_zone       = ${bit(b.chk_zone)},
                lenght_acc     = '${txt(b.lenght_acc)}',
                barcode        = '${txt(b.barcode)}',
                cfs_code       = '${txt(b.cfs_code)}',
                active         = ${bit(b.active)}
            WHERE unico = '${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Carrier updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        // Check invoices dependency
        const inv = await executeProcedure("sp_flower_carriers_invoices_detail", { lccarrier_uq: unico });
        if (inv.recordset.length > 0) {
            return NextResponse.json({ success: false, error: `You have ${inv.recordset.length} related records in the Invoices Detail.! You can't delete this record.` }, { status: 400 });
        }
        // Check customers dependency
        const cust = await executeProcedure("sp_flower_customers_shipto_by_carrier", { lccarrier_uq: unico });
        if (cust.recordset.length > 0) {
            return NextResponse.json({ success: false, error: `You have ${cust.recordset.length} related records in the Customers Detail.! You can't delete this record.` }, { status: 400 });
        }
        await executeQuery(`DELETE FROM flower_carriers WHERE unico = '${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Carrier deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
