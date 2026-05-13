import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
        }

        const result = await executeProcedure("sp_NC_user_access_detail", {
            lcCompany_uq: process.env.COMPANY_ID || 'R7X98780',
            lcgcuser_uq: userId,
        }, true);

        // Filter for APP and SISTEMA modules only
        const filteredMenu = result.recordset.filter((item: any) => {
            const mClass = String(item.module_class || '').trim().toUpperCase();
            return mClass === 'APP' || mClass === 'SISTEMA';
        });

        return NextResponse.json({ success: true, menu: filteredMenu });
    } catch (error: any) {
        console.error("Menu API error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
