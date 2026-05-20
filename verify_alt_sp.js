require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');
const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_HOST||'', port: parseInt(process.env.DB_PORT||'1433'), database: process.env.DB_NAME, options: { encrypt: true, trustServerCertificate: process.env.DB_TRUST_CERT==='true', enableArithAbort: true, connectTimeout: 15000 }};
async function main() {
    const pool = await sql.connect(config);
    const r0 = await pool.request().query(`SELECT TOP 1 unico FROM flower_products WHERE active=1`);
    const unico = r0.recordset[0]?.unico;
    // Page 1
    const r1 = await pool.request()
        .input('lcproduct_uq',  sql.VarChar(8),  unico)
        .input('lcdescription', sql.VarChar(20), '%')
        .input('lnPageNumber',  sql.Int, 1)
        .input('lnRowsOfPage',  sql.Int, 50)
        .execute('sp_flower_products_alternative_not_in');
    const total = r1.recordset[0]?.QueryTotalRecords;
    console.log(`Product: ${unico} | Page 1 rows: ${r1.recordset.length} | QueryTotalRecords: ${total}`);
    // Page 2
    const r2 = await pool.request()
        .input('lcproduct_uq',  sql.VarChar(8),  unico)
        .input('lcdescription', sql.VarChar(20), '%')
        .input('lnPageNumber',  sql.Int, 2)
        .input('lnRowsOfPage',  sql.Int, 50)
        .execute('sp_flower_products_alternative_not_in');
    console.log(`Product: ${unico} | Page 2 rows: ${r2.recordset.length} | QueryTotalRecords: ${r2.recordset[0]?.QueryTotalRecords}`);
    await pool.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
