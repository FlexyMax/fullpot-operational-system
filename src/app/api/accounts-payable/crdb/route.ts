import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v || "").replace(/'/g, "''");

export async function GET(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const result = await executeProcedure("SP_NC_ACCOUNTS_PAY_CRDB", { lccrdb_uq: unico });
        return NextResponse.json(result.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { acc_pay_uq, type, cd_date, reason_uq, cd_ammount, retention_no, details } = body;
    try {
        await executeQuery(`
            INSERT INTO flower_accounts_pay_crdb
                (acc_pay_uq, type, cd_date, reason_uq, cd_ammount, retention_no, details)
            VALUES
                ('${txt(acc_pay_uq)}', '${txt(type)}', '${txt(cd_date)}',
                 '${txt(reason_uq)}', ${parseFloat(cd_ammount) || 0},
                 '${txt(retention_no)}', '${txt(details)}')
        `);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { unico, type, cd_date, reason_uq, cd_ammount, retention_no, details } = body;
    try {
        await executeQuery(`
            UPDATE flower_accounts_pay_crdb SET
                type         = '${txt(type)}',
                cd_date      = '${txt(cd_date)}',
                reason_uq    = '${txt(reason_uq)}',
                cd_ammount   = ${parseFloat(cd_ammount) || 0},
                retention_no = '${txt(retention_no)}',
                details      = '${txt(details)}'
            WHERE unico = '${txt(unico)}'
        `);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        await executeQuery(`DELETE FROM flower_accounts_pay_crdb WHERE unico = '${txt(unico)}'`);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
