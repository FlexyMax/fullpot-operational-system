import sql from "mssql";
const config = {
    user: "azure", password: "FullPot1516sql$$$",
    server: "flexymaxfpsql.public.9a4b26c7b85f.database.windows.net",
    port: 3342, database: "fullpot",
    options: { encrypt: true, trustServerCertificate: true, enableArithAbort: true },
};
const pool = await sql.connect(config);
for (const name of process.argv.slice(2)) {
    console.log(`\n=== ${name} ===`);
    const r = await pool.request().query(`SELECT OBJECT_DEFINITION(OBJECT_ID('${name}')) AS def`);
    console.log(r.recordset[0]?.def ?? "NOT FOUND");
}
await pool.close();
