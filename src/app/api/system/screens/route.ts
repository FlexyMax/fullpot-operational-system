import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import crypto from "crypto";

const txt   = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit   = (v: any) => (v ? 1 : 0);
const genUq = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export async function POST(req: NextRequest) {
    const body = await req.json();
    const unico = genUq();
    const { modulo_uq, nombre, orden, run_pantalla, executable, image, path, menu, web_form, descripcion } = body;
    try {
        await executeQuery(`
            INSERT INTO pantalla (unico,modulo_uq,nombre,orden,run_pantalla,executable,image,path,menu,web_form,descripcion,timestamp)
            VALUES('${txt(unico)}','${txt(modulo_uq)}','${txt(nombre)}',${parseInt(orden)||0},
                   '${txt(run_pantalla)}','${txt(executable)}','${txt(image)}','${txt(path)}',
                   ${bit(menu)},'${txt(web_form)}','${txt(descripcion)}',GETDATE())`, true);
        return NextResponse.json({ success: true, unico, message: "Screen created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
