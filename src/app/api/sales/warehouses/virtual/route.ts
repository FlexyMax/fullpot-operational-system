import { NextResponse } from 'next/server';
import { executeProcedure } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const physical = searchParams.get('physical') || '%';

        const result = await executeProcedure("sp_flower_salesman_warehouses_with_all", {
            user_id: (session.user as any).id || '%',
            param2: 1,
            location: physical
        });

        return NextResponse.json({
            success: true,
            warehouses: result.recordset || []
        });
    } catch (error: any) {
        console.error('Error fetching virtual warehouses:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
