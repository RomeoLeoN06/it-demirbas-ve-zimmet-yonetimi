const sql = require('mssql');

const config = {
  user: 'it_admin',
  password: 'ItDemirbas2026!',
  server: 'localhost',
  port: 50162,
  database: 'ITDemirbasDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

function translateSql(sqlText) {
  let paramIndex = 0;
  let translated = sqlText.replace(/\?/g, () => `@p${paramIndex++}`);
  
  // Convert LIMIT x OFFSET y to OFFSET y ROWS FETCH NEXT x ROWS ONLY
  translated = translated.replace(/LIMIT\s+(@p\d+|\d+)\s+OFFSET\s+(@p\d+|\d+)/i, (match, limit, offset) => {
    return `OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
  });

  return translated;
}

async function queryAll(sqlText, params = []) {
  const p = await getPool();
  const req = p.request();
  const translated = translateSql(sqlText);

  params.forEach((val, i) => {
    req.input(`p${i}`, val === undefined ? null : val);
  });

  const res = await req.query(translated);
  return res.recordset;
}

async function queryOne(sqlText, params = []) {
  const rows = await queryAll(sqlText, params);
  return rows[0] || null;
}

async function run(sqlText, params = []) {
  const p = await getPool();
  const req = p.request();
  let translated = translateSql(sqlText);

  const isInsert = /^\s*INSERT\s+INTO/i.test(translated);
  if (isInsert && !/OUTPUT\s+INSERTED/i.test(translated)) {
    translated += '; SELECT SCOPE_IDENTITY() AS lastInsertRowid;';
  }

  params.forEach((val, i) => {
    req.input(`p${i}`, val === undefined ? null : val);
  });

  const res = await req.query(translated);
  const lastInsertRowid = res.recordset && res.recordset[0] ? res.recordset[0].lastInsertRowid : null;
  return {
    lastInsertRowid,
    rowsAffected: res.rowsAffected[0]
  };
}

async function test() {
  try {
    console.log('Testing queryOne...');
    const user = await queryOne('SELECT * FROM users WHERE email = ?', ['admin@kurum.gov.tr']);
    console.log('User found:', user ? user.full_name : 'None');

    console.log('Testing queryAll with LIMIT / OFFSET...');
    const users = await queryAll('SELECT id, full_name FROM users ORDER BY id ASC LIMIT ? OFFSET ?', [2, 1]);
    console.log('Pagination result (limit 2, offset 1):', users);

    console.log('Testing INSERT run...');
    const insertRes = await run('INSERT INTO audit_logs (action, details) VALUES (?, ?)', ['test_action', 'Test log entry']);
    console.log('Insert result:', insertRes);

    await pool.close();
    console.log('ALL ADAPTER TESTS PASSED!');
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
