import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type P = { params: Promise<{ unico: string }> };

// GET /api/standing-orders/box-composition/[unico] — load composition rows for a line
export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_sales_orders_boxes_composition", {
            lcsorder_d_uq: unico,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/standing-orders/box-composition/[unico] — add a composition row
export async function POST(req: NextRequest, { params }: P) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { unico } = await params;
    try {
        const b = await req.json();
        const r = await executeProcedure("sp_flower_sales_orders_boxes_composition_insert", {
            lcsorder_d_uq: unico,
            lcproduct_uq:  b.product_uq  ?? "",
            lnbunches_case: parseInt(b.bunches_case ?? 1),
            lnup_x_pack:    parseInt(b.up_x_pack    ?? 1),
            lnporcentage:   parseFloat(b.porcentage  ?? 0),
            lnso_price:     parseFloat(b.so_price    ?? 0),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? null });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE /api/standing-orders/box-composition/[unico] — delete one composition row
export async function DELETE(_req: NextRequest, { params }: P) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_sales_orders_boxes_composition_delete", {
            lcunico: unico,
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
