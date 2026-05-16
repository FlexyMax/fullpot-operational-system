import { NextRequest, NextResponse } from "next/server";
import { getSistemaPool } from "@/lib/db";
import sql from "mssql";
import crypto from "crypto";

const txt = (v: string) => String(v ?? "").replace(/'/g, "''");

function extractJpeg(buf: Buffer): Buffer | null {
    for (let i = 0; i < buf.length - 3; i++) {
        if (buf[i] === 0xFF && buf[i + 1] === 0xD8 && buf[i + 2] === 0xFF) {
            return buf.subarray(i);
        }
    }
    return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const pool   = await getSistemaPool();
        const result = await pool.request()
            .input("unico", sql.VarChar(8), unico)
            .query("SELECT logo FROM empresas WHERE unico = @unico");
        const row = result.recordset[0];
        if (!row?.logo) return new NextResponse(null, { status: 204 });
        const buf  = Buffer.isBuffer(row.logo) ? row.logo : Buffer.from(row.logo);
        const jpeg = extractJpeg(buf);
        if (!jpeg) return new NextResponse(null, { status: 204 });
        return new NextResponse(jpeg.buffer as ArrayBuffer, {
            headers: { "Content-Type": "image/jpeg", "Cache-Control": "max-age=3600" },
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const formData = await req.formData();
        const file = formData.get("logo") as File | null;
        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
        const buffer = Buffer.from(await file.arrayBuffer());
        const pool   = await getSistemaPool();
        await pool.request()
            .input("logo",  sql.VarBinary(sql.MAX), buffer)
            .input("unico", sql.VarChar(8), unico)
            .query("UPDATE empresas SET logo = @logo WHERE unico = @unico");
        return NextResponse.json({ success: true, logo_url: `/api/system/companies/${unico}/logo?t=${Date.now()}` });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
