import { NextRequest, NextResponse } from "next/server";
import { getSistemaPool } from "@/lib/db";
import sql from "mssql";
import crypto from "crypto";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");

/** Extract JPEG bytes from a VFP General/Image binary field wrapper */
function extractJpeg(buf: Buffer): Buffer | null {
    for (let i = 0; i < buf.length - 3; i++) {
        if (buf[i] === 0xFF && buf[i + 1] === 0xD8 && buf[i + 2] === 0xFF) {
            return buf.subarray(i);
        }
    }
    return null;
}

/** Serve the user's photo as image/jpeg */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const pool   = await getSistemaPool();
        const result = await pool.request()
            .input("unico", sql.VarChar(8), unico)
            .query("SELECT foto FROM usuarios_fotos WHERE user_uq = @unico");

        const row = result.recordset[0];
        if (!row?.foto) {
            return new NextResponse(null, { status: 204 });
        }
        const buf  = Buffer.isBuffer(row.foto) ? row.foto : Buffer.from(row.foto);
        const jpeg = extractJpeg(buf);
        if (!jpeg) return new NextResponse(null, { status: 204 });

        return new NextResponse(jpeg.buffer as ArrayBuffer, {
            headers: {
                "Content-Type":  "image/jpeg",
                "Cache-Control": "max-age=3600",
            },
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/** Upload / replace user photo — stores binary in usuarios_fotos.foto */
export async function POST(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const formData = await req.formData();
        const file = formData.get("photo") as File | null;
        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        const arrayBuffer = await file.arrayBuffer();
        const buffer      = Buffer.from(arrayBuffer);

        const pool    = await getSistemaPool();
        const request = pool.request();
        request.input("foto",     sql.VarBinary(sql.MAX), buffer);
        request.input("user_uq",  sql.VarChar(8), unico);

        const exists = await pool.request()
            .input("user_uq", sql.VarChar(8), unico)
            .query("SELECT COUNT(*) cnt FROM usuarios_fotos WHERE user_uq = @user_uq");

        if (exists.recordset[0].cnt > 0) {
            await request.query("UPDATE usuarios_fotos SET foto = @foto WHERE user_uq = @user_uq");
        } else {
            const newUnico = crypto.randomBytes(4).toString("hex").toUpperCase();
            request.input("unico", sql.VarChar(8), newUnico);
            await request.query("INSERT INTO usuarios_fotos (unico, user_uq, foto, timestamp) VALUES (@unico, @user_uq, @foto, GETDATE())");
        }

        return NextResponse.json({ success: true, photo_url: `/api/system/users/${unico}/photo?t=${Date.now()}` });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
