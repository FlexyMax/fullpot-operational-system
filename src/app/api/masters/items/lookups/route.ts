import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const [grades, colors, cases, types, units] = await Promise.all([
            executeProcedure("sp_flower_grades_list", { lcgrade: "%" }),
            executeProcedure("sp_flower_colors_list", {}),
            executeProcedure("sp_flower_cases_list",  {}),
            executeProcedure("sp_NC_varieties_types_list", {}),
            executeProcedure("sp_flower_products_units", { lcsearch: "%" }).catch(() => ({ recordset: [] })),
        ]);
        return NextResponse.json({
            grades:  grades.recordset,
            colors:  colors.recordset,
            cases:   cases.recordset,
            types:   types.recordset,
            units:   units.recordset,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
