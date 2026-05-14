import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const ALLOWED = new Set(["acceso", "crear", "editar", "borrar", "consultar", "reportes"]);

export async function PUT(req: NextRequest) {
    const { userUnico, field, value } = await req.json();
    if (!userUnico || !field) return NextResponse.json({ error: "userUnico and field required" }, { status: 400 });
    if (!ALLOWED.has(field)) return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    const txt = (v: string) => String(v).replace(/'/g, "''");
    try {
        await executeQuery(
            `UPDATE usuarios_accesos SET ${field} = ${value ? 1 : 0} WHERE user_uq = '${txt(userUnico)}'`,
            true
        );
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
