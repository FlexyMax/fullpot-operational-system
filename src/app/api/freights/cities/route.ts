import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";
import crypto from "crypto";

const txt   = (v: any) => String(v ?? "").replace(/'/g, "''");
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "%";
    try {
        const r = await executeProcedure("sp_flower_cities", { lccity: search.includes("%") ? search : `%${search}%` });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    const unico = genUq();
    try {
        const r = await executeProcedure("sp_flower_cities_insert", {
            lccity: txt(b.city),
            lccountry_iso: txt(b.country_iso),
            lcbuyer_email: txt(b.buyer_email)
        });
        const row = r.recordset?.[0] || {};
        if (row.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row.unico || row.Unico || unico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
