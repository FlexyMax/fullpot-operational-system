import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const result = await executeProcedure("sp_sistema_modulos_lista_activos", {}, true);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
