require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');
const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_HOST||'', port: parseInt(process.env.DB_PORT||'1433'), database: process.env.DB_NAME, options: { encrypt: true, trustServerCertificate: process.env.DB_TRUST_CERT==='true', enableArithAbort: true, connectTimeout: 15000 }};

async function main() {
    const pool = await sql.connect(config);

    const list = await pool.request().execute('sp_flower_store_procedures');
    console.log(`--- ${list.recordset.length} active reports in flower_store_procedures ---`);
    console.table(list.recordset.map(r => ({ unico: r.unico, sp: r.store_procedure, title: r.Sp_tittle })));

    console.log('\n--- Parameter signatures for each store_procedure ---');
    for (const row of list.recordset) {
        const spName = row.store_procedure;
        try {
            const params = await pool.request().input('sp', sql.VarChar, spName).query(`
                SELECT p.name, t.name AS type_name, p.parameter_id
                FROM sys.parameters p
                JOIN sys.types t ON p.user_type_id = t.user_type_id
                WHERE p.object_id = OBJECT_ID(@sp)
                ORDER BY p.parameter_id
            `);
            const sig = params.recordset.map(p => `${p.name} ${p.type_name}`).join(', ');
            console.log(`${spName}: (${sig})`);
        } catch (e) {
            console.log(`${spName}: ERROR ${e.message}`);
        }
    }

    await pool.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
