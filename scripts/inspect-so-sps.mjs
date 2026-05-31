// Script to inspect Standing Orders stored procedure parameters
import sql from "mssql";

const config = {
    user: "azure",
    password: "FullPot1516sql$$$",
    server: "flexymaxfpsql.public.9a4b26c7b85f.database.windows.net",
    port: 3342,
    database: "fullpot",
    options: { encrypt: true, trustServerCertificate: true, enableArithAbort: true },
};

const SP_LIST = [
    "sp_flower_standing_orders_search",
    "sp_flower_standing_orders_header_by_customer",
    "sp_flower_standing_order_uq",
    "sp_flower_standing_orders_header_insert",
    "sp_flower_standing_orders_header_update",
    "sp_flower_standing_orders_header_delete",
    "sp_flower_standing_orders_header_total_boxes",
    "sp_flower_standing_orders_detail_insert",
    "sp_flower_standing_orders_detail_update",
    "sp_flower_standing_orders_detail_delete",
    "sp_flower_standing_orders_detail_growers",
    "sp_flower_standing_orders_change_salesman",
    "sp_flower_standing_orders_to_default_farm",
    "sp_flower_customers_list_to_prebooks",
    "sp_flower_salesman_uq",
    "sp_flower_salesman_list",
    "sp_flower_salesman_warehouses",
    "sp_flower_customer_profile",
    "sp_flower_customers_terms",
    "sp_flower_customer_carriers",
    "sp_flower_growers_list",
];

try {
    const pool = await sql.connect(config);
    const nameList = SP_LIST.map(n => `'${n}'`).join(",");
    const result = await pool.request().query(`
        SELECT
            p.SPECIFIC_NAME AS sp_name,
            p.PARAMETER_NAME AS param_name,
            p.DATA_TYPE AS data_type,
            p.CHARACTER_MAXIMUM_LENGTH AS max_len,
            p.ORDINAL_POSITION AS pos
        FROM INFORMATION_SCHEMA.PARAMETERS p
        WHERE p.SPECIFIC_NAME IN (${nameList})
        ORDER BY p.SPECIFIC_NAME, p.ORDINAL_POSITION
    `);

    let current = "";
    for (const row of result.recordset) {
        if (row.sp_name !== current) {
            current = row.sp_name;
            console.log(`\n=== ${current} ===`);
        }
        const len = row.max_len ? `(${row.max_len})` : "";
        console.log(`  [${row.pos}] ${row.param_name}  ${row.data_type}${len}`);
    }

    // Also check which SPs actually exist
    const existResult = await pool.request().query(`
        SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES
        WHERE ROUTINE_NAME IN (${nameList})
        ORDER BY ROUTINE_NAME
    `);
    console.log("\n=== EXISTING SPs ===");
    existResult.recordset.forEach(r => console.log(" ✓", r.ROUTINE_NAME));

    const existNames = existResult.recordset.map(r => r.ROUTINE_NAME);
    const missing = SP_LIST.filter(n => !existNames.includes(n));
    if (missing.length) {
        console.log("\n=== MISSING SPs ===");
        missing.forEach(n => console.log(" ✗", n));
    }

    await pool.close();
} catch (e) {
    console.error("Error:", e.message);
}
