import { NextResponse } from 'next/server';
import { executeProcedure } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await executeProcedure("sp_flower_warehouse_physical_list", {
            param: 1
        });

        return NextResponse.json({
            success: true,
            warehouses: result.recordset || []
        });
    } catch (error: any) {
        console.error('Error fetching physical warehouses:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
