import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ awbcode: string }> }) {
    const { awbcode } = await params;
    if (!awbcode) return NextResponse.json({ success: false, error: "AWB code is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_awbs_delete", { lcawbcode: awbcode });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ awbcode: string }> }) {
    const { awbcode } = await params;
    const b = await req.json();
    if (!awbcode) return NextResponse.json({ success: false, error: "AWB code is required." }, { status: 400 });
    if (!b.new_date) return NextResponse.json({ success: false, error: "New date is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_awbs_date_update", {
            lcawbcode: awbcode,
            ldnew_date: b.new_date,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
