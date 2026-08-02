import sql from "mssql";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const cfg: sql.config = {
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server:   process.env.DB_HOST || "",
    port:     parseInt(process.env.DB_PORT || "1433"),
    database: process.env.DB_NAME,
    options:  { encrypt: true, trustServerCertificate: process.env.DB_TRUST_CERT === "true", enableArithAbort: true },
};

(async () => {
    const pool = await new sql.ConnectionPool(cfg).connect();
    const dt = new Date("2026-08-02");

    // Count with and without qty_confirm filter
    const r1 = await pool.request().query(`
        SELECT COUNT(*) AS total_all,
               SUM(CASE WHEN qty_confirm > 0 THEN 1 ELSE 0 END) AS confirmed_only
        FROM dbo.flower_prebook_box_porder
        WHERE DATEDIFF(day, ship_date, '2026-08-02') = 0
    `);
    console.log("flower_prebook_box_porder for 2026-08-02:", r1.recordset[0]);

    // Test NC SP with and without filter
    const r2 = await pool.request()
        .input("grower_uq", sql.Char(8), "%")
        .input("date", sql.DateTime, dt)
        .execute("sp_NC_porders_by_grower");
    console.log(`sp_NC_porders_by_grower ALL with qty_confirm>0: ${r2.recordset.length} rows`);

    await pool.close();
})().catch(err => { console.error("❌", err.message); process.exit(1); });
