require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');
const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_HOST||'', port: parseInt(process.env.DB_PORT||'1433'), database: process.env.DB_NAME, options: { encrypt: true, trustServerCertificate: process.env.DB_TRUST_CERT==='true', enableArithAbort: true, connectTimeout: 30000 }, requestTimeout: 120000 };

const VALID_SP_NAME = /^[A-Za-z0-9_]+$/;

async function runPositional(pool, spName, p1, p2) {
    if (!VALID_SP_NAME.test(spName)) throw new Error('invalid name');
    const request = pool.request();
    request.input('p1', p1);
    request.input('p2', p2);
    return request.query(`EXEC [${spName}] @p1, @p2`);
}

async function main() {
    const pool = await sql.connect(config);

    // 1) Catalog lookup exactly as the API route does it
    const catalog = await pool.request().execute('sp_flower_store_procedures');
    const find = (unico) => catalog.recordset.find(r => String(r.unico).trim() === unico);

    const smallStart = new Date('2026-06-01');
    const smallEnd   = new Date('2026-06-15');

    const samples = [
        { unico: '8B08F6C8', label: 'ACTIVE CUSTOMERS LIST (@date_ini/@date_end)' },
        { unico: 'B5DEC1D8', label: 'AWB NO CHARGES REPORT (@start_date/@end_date)' },
        { unico: '70413F10', label: 'AVAILABILITY TO SALES TEAM (@lddate_from/@lddate_to date)' },
    ];

    for (const s of samples) {
        const report = find(s.unico);
        if (!report) { console.log(`[SKIP] ${s.label} — not in catalog`); continue; }
        const spName = String(report.store_procedure).trim();
        try {
            const r = await runPositional(pool, spName, smallStart, smallEnd);
            const rows = r.recordset ?? [];
            console.log(`[OK] ${s.label} -> ${spName}: ${rows.length} rows, columns=${rows.length ? Object.keys(rows[0]).slice(0,6).join(',') : 'n/a'}`);
        } catch (e) {
            console.log(`[FAIL] ${s.label} -> ${spName}: ${e.message}`);
        }
    }

    // 2) The exact report + range the user asked about
    console.log('\n--- Full operational report run (2026-01-01 to 2026-06-20) ---');
    const opReport = find('E07E62AF');
    const spName = String(opReport.store_procedure).trim();
    const t0 = Date.now();
    const r = await runPositional(pool, spName, new Date('2026-01-01'), new Date('2026-06-20'));
    const rows = r.recordset ?? [];
    const ms = Date.now() - t0;
    console.log(`[OK] ${spName}: ${rows.length} rows in ${ms}ms`);
    console.log('Columns:', rows.length ? Object.keys(rows[0]).join(', ') : 'n/a');
    console.log('JSON size (approx):', rows.length ? (Buffer.byteLength(JSON.stringify(rows)) / 1024 / 1024).toFixed(1) + ' MB' : 'n/a');

    await pool.close();
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
