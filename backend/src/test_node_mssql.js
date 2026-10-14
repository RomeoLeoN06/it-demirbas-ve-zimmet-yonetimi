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

async function test() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT COUNT(*) as user_count FROM users');
    console.log('CONNECTED TO MSSQL VIA NODE.JS!', result.recordset[0]);
    await pool.close();
  } catch (err) {
    console.error('FAILED TO CONNECT:', err.message);
  }
}

test();
