require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');
const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_HOST||'', port: parseInt(process.env.DB_PORT||'1433'), database: process.env.DB_NAME, options: { encrypt: true, trustServerCertificate: process.env.DB_TRUST_CERT==='true', enableArithAbort: true, connectTimeout: 15000 }};
const SPS = [
    'sp_flower_products_list_to_update_stocks',
    'sp_flower_products_seasons_not_in',
    'sp_flower_products_alternative_recipes_not_in',
    'sp_flower_customers_list_with_all',
    'sp_flower_varieties_search',
];
async function main() {
    const pool = await sql.connect(config);
    for (const sp of SPS) {
        const r = await pool.request().query(`SELECT OBJECT_DEFINITION(OBJECT_ID('${sp}')) AS def`);
        console.log('\n' + '='.repeat(70));
        console.log(sp);
        console.log('='.repeat(70));
        console.log(r.recordset[0].def);
    }
    await pool.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
