import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";
import crypto from "crypto";

const txt   = (v: any) => String(v ?? "").replace(/'/g, "''");
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "%";
    try {
        const r = await executeProcedure("sp_flower_airlines_search", { lcsearch: search.includes("%") ? search : `%${search}%` });
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
            INSERT INTO flower_airlines (unico,cod_linea,airline,address,city,country,phone,fax,email,contact)
            VALUES('${txt(unico)}','${txt(b.cod_linea)}','${txt(b.airline)}','${txt(b.address)}',
                   '${txt(b.city)}','${txt(b.country)}','${txt(b.phone)}','${txt(b.fax)}','${txt(b.email)}','${txt(b.contact)}')`);
        return NextResponse.json({ success: true, unico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
