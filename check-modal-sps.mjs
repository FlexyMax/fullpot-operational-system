import sql from 'mssql';

const config = {
  server: 'flexymaxfpsql.public.9a4b26c7b85f.database.windows.net',
  port: 3342,
  user: 'azure',
  password: 'FullPot1516sql$$$',
  database: 'fullpot',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const sps = [
  'sp_flower_packing_box_move',
  'sp_flower_warehouse_physical_list',
  'sp_flower_awb_by_date_wphouse',
  'sp_flower_invoice_insert_from_periods',
  'sp_flower_packing_to_whouse',
  'sp_flower_warehouses_by_pwhouse',
  'sp_flower_packing_copy',
  'sp_flower_growers_list',
  'sp_flower_packing_box_update_whcontrol',
  'sp_flower_awb_setup_search',
  'sp_flower_awb_setup_line',
  'sp_flower_awbs_setup_insert',
  'sp_flower_awbs_setup_update',
  'sp_flower_awbs_setup_delete',
  'sp_flower_packing_details',
  'sp_flower_packing_box_delete',
  'sp_flower_cities',
  'sp_flower_packing_box_transfer',
  'sp_flower_inventory_insert_from_porder',
  'sp_flower_cases_list',
];

async function main() {
  let pool;
  try {
    pool = await sql.connect(config);

    for (const spName of sps) {
      console.log(`\n${spName}`);

      const result = await pool.request()
        .input('spName', sql.NVarChar, spName)
        .query(`
          SELECT
            p.name            AS param_name,
            tp.name           AS type_name,
            p.max_length,
            p.precision,
            p.scale,
            p.has_default_value
          FROM sys.objects o
          JOIN sys.parameters p  ON p.object_id = o.object_id
          JOIN sys.types tp      ON tp.user_type_id = p.user_type_id
          WHERE o.name = @spName
            AND o.type = 'P'
          ORDER BY p.parameter_id
        `);

      if (result.recordset.length === 0) {
        // Check if the SP exists at all (no params vs not found)
        const existsResult = await pool.request()
          .input('spName', sql.NVarChar, spName)
          .query(`
            SELECT COUNT(*) AS cnt
            FROM sys.objects
            WHERE name = @spName AND type = 'P'
          `);
        if (existsResult.recordset[0].cnt === 0) {
          console.log('  NOT FOUND');
        } else {
          console.log('  (no parameters)');
        }
      } else {
        for (const row of result.recordset) {
          let typeStr = row.type_name;
          if (['varchar', 'nvarchar', 'char', 'nchar'].includes(typeStr)) {
            const len = row.max_length === -1 ? 'MAX' : (typeStr.startsWith('n') ? row.max_length / 2 : row.max_length);
            typeStr += `(${len})`;
          } else if (['decimal', 'numeric'].includes(typeStr)) {
            typeStr += `(${row.precision},${row.scale})`;
          }
          const hasDefault = row.has_default_value ? 'true' : 'false';
          console.log(`  ${row.param_name} ${typeStr} default=${hasDefault}`);
        }
      }
    }
  } catch (err) {
    console.error('Connection/query error:', err.message);
  } finally {
    if (pool) await pool.close();
  }
}

main();
