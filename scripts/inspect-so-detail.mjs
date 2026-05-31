import sql from "mssql";

const config = {
    user: "azure", password: "FullPot1516sql$$$",
    server: "flexymaxfpsql.public.9a4b26c7b85f.database.windows.net",
    port: 3342, database: "fullpot",
    options: { encrypt: true, trustServerCertificate: true, enableArithAbort: true },
};

try {
    const pool = await sql.connect(config);

    // 1. Find all SPs with "order" + ("detail" or "box" or "line") in the name
    const found = await pool.request().query(`
        SELECT r.ROUTINE_NAME, p.PARAMETER_NAME, p.DATA_TYPE, p.ORDINAL_POSITION
        FROM INFORMATION_SCHEMA.ROUTINES r
        LEFT JOIN INFORMATION_SCHEMA.PARAMETERS p ON r.ROUTINE_NAME = p.SPECIFIC_NAME
        WHERE r.ROUTINE_NAME LIKE '%standing_order%'
           OR r.ROUTINE_NAME LIKE '%sales_order%detail%'
           OR r.ROUTINE_NAME LIKE '%sales_order%box%'
           OR r.ROUTINE_NAME LIKE '%so_detail%'
           OR r.ROUTINE_NAME LIKE '%sorder%detail%'
           OR r.ROUTINE_NAME LIKE '%sorder%box%'
        ORDER BY r.ROUTINE_NAME, p.ORDINAL_POSITION
    `);

    let cur = "";
    for (const row of found.recordset) {
        if (row.ROUTINE_NAME !== cur) { cur = row.ROUTINE_NAME; console.log(`\n=== ${cur} ===`); }
        if (row.PARAMETER_NAME) console.log(`  [${row.ORDINAL_POSITION}] ${row.PARAMETER_NAME}  ${row.DATA_TYPE}`);
    }

    // 2. Call sp_flower_standing_order_uq with a real unico and inspect ALL recordsets
    console.log("\n\n=== CALLING sp_flower_standing_order_uq with first available unico ===");
    const unicos = await pool.request().query(
        `SELECT TOP 1 unico FROM flower_sales_orders WHERE order_type = 'SO' OR sorder_no IS NOT NULL ORDER BY sorder_no DESC`
    );
    const unico = unicos.recordset?.[0]?.unico;
    console.log("unico =", unico);
    if (unico) {
        const req = pool.request();
        req.input("lcso_uq", unico);
        const r = await req.execute("sp_flower_standing_order_uq");
        const sets = r.recordsets ?? [r.recordset];
        console.log(`\nTotal recordsets returned: ${sets.length}`);
        sets.forEach((rs, i) => {
            console.log(`\n--- Recordset[${i}] (${rs.length} rows) ---`);
            if (rs.length > 0) {
                console.log("Columns:", Object.keys(rs[0]).join(", "));
                console.log("Row[0]:", JSON.stringify(rs[0]).substring(0, 500));
            } else {
                console.log("(empty)");
            }
        });
    }

    await pool.close();
} catch (e) { console.error("Error:", e.message); }
