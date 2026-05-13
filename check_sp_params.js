/**
 * check_sp_params.js
 * Queries SQL Server for the exact parameter names and types
 * of all A/P stored procedures, so we can fix API routes without guessing.
 *
 * Run: node check_sp_params.js
 */

require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');

const config = {
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server:   process.env.DB_HOST || '',
    port:     parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME,
    options: {
        encrypt:                true,
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
        enableArithAbort:       true,
        connectTimeout:         15000,
    }
};

const SP_LIST = [
    // A/P core
    'sp_flower_accounts_pay_years',
    'sp_flower_accounts_pay_years_dates',
    'sp_flower_accounts_pay_years_dates_list',
    'sp_flower_accounts_pay_up',
    'sp_flower_accounts_pay_details',
    // Tabs
    'sp_flower_accounts_pay_pobs',
    'sp_flower_prebook_cost',
    'sp_flower_accounts_pay_credits_debits',
    // Lookups
    'sp_flower_growers_list',
    'sp_flower_growers_terms',
    'sp_flower_accounts_pay_type_list',
    'sp_flower_terms',
    'sp_flower_crdb_reasons_list',
    // POB modal
    'sp_flower_accounts_pay_total_pobs',
    'sp_flower_accounts_pay_pob_insert',
    'sp_flower_accounts_pay_pob_update',
    'sp_flower_accounts_pay_pob_delete',
    'sp_flower_accounts_pay_approve_cost',
    'sp_flower_pob_search_no',
    // ── A/P Invoice CRUD (candidates) ──
    'sp_flower_accounts_pay_insert',
    'sp_flower_accounts_pay_update',
    'sp_flower_accounts_pay_delete',
    'sp_flower_accounts_pay_add',
    'sp_flower_accounts_pay_edit',
    'sp_flower_accounts_pay_new',
    'sp_flower_ap_insert',
    'sp_flower_ap_update',
    'sp_flower_ap_delete',
];

async function main() {
    console.log(`\nConnecting to ${config.server} / ${config.database}...\n`);
    const pool = await sql.connect(config);
    console.log('Connected.\n');
    console.log('='.repeat(60));

    for (const spName of SP_LIST) {
        const res = await pool.request()
            .input('spName', sql.VarChar(200), spName)
            .query(`
                SELECT
                    p.name          AS param_name,
                    t.name          AS param_type,
                    p.max_length    AS max_length,
                    p.precision     AS precision,
                    p.scale         AS scale,
                    p.is_output     AS is_output,
                    p.has_default_value AS has_default
                FROM sys.parameters  p
                JOIN sys.objects     o ON p.object_id    = o.object_id
                JOIN sys.types       t ON p.user_type_id = t.user_type_id
                WHERE o.name = @spName
                ORDER BY p.parameter_id
            `);

        console.log(`\n${spName}`);

        if (res.recordset.length === 0) {
            // SP not found in this DB — check if it exists at all
            const chk = await pool.request()
                .input('spName', sql.VarChar(200), spName)
                .query(`SELECT COUNT(*) AS cnt FROM sys.objects WHERE name = @spName AND type = 'P'`);
            const exists = chk.recordset[0].cnt > 0;
            console.log(exists
                ? '  ⚠️  SP exists but has NO parameters'
                : '  ❌  SP NOT FOUND in this database');
        } else {
            res.recordset.forEach(p => {
                const typeStr = p.param_type === 'varchar' || p.param_type === 'nvarchar'
                    ? `${p.param_type}(${p.max_length === -1 ? 'MAX' : p.max_length})`
                    : p.param_type === 'decimal' || p.param_type === 'numeric'
                        ? `${p.param_type}(${p.precision},${p.scale})`
                        : p.param_type;
                const flags = [
                    p.is_output  ? 'OUTPUT'  : '',
                    p.has_default ? 'has default' : '',
                ].filter(Boolean).join(', ');
                console.log(`  ${p.param_name.padEnd(30)} ${typeStr}${flags ? `  [${flags}]` : ''}`);
            });
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Done.\n');
    await pool.close();
}

main().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});
