import sql from "mssql";
import * as fs from "fs";
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
    const spSql = fs.readFileSync("sql/inventory-entry/sp_NC_porders_by_grower.sql", "utf8");
    await pool.request().query(spSql);
    console.log("✅ sp_NC_porders_by_grower created successfully");
    // Quick smoke test
    const r = await pool.request()
        .input("grower_uq", sql.Char(8), "%")
        .input("date", sql.DateTime, new Date("2026-07-01"))
        .execute("sp_NC_porders_by_grower");
    console.log(`✅ Smoke test (ALL growers, 2026-07-01): ${r.recordset.length} rows`);
    if (r.recordset.length > 0) {
        const row = r.recordset[0];
        console.log("  Sample row:", JSON.stringify({ grower: row.grower, description: row.description, qty_porder: row.qty_porder, dispatched: row.dispatched }));
    }
    await pool.close();
})().catch(err => { console.error("❌", err.message); process.exit(1); });
