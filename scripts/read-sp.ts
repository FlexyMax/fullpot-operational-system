// Quick script to read SP definition from SQL Server
// Run with: npx tsx scripts/read-sp.ts
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
    const r = await pool.request().query(`
        SELECT OBJECT_DEFINITION(OBJECT_ID('sp_flower_porders_by_grower')) AS def
    `);
    console.log(r.recordset[0]?.def ?? "(not found)");
    await pool.close();
})().catch(console.error);
