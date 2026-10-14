const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'it_admin',
  password: process.env.DB_PASSWORD || 'ItDemirbas2026!',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '50162'),
  database: process.env.DB_NAME || 'ITDemirbasDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('[MSSQL] Connected to Microsoft SQL Server (ITDemirbasDB on METEHAN\\SQLEXPRESS)!');
    } catch (err) {
      console.error('[MSSQL] Connection error:', err.message);
      throw err;
    }
  }
  return pool;
}

function translateSql(sqlText) {
  let paramIndex = 0;
  let translated = sqlText.replace(/\?/g, () => `@p${paramIndex++}`);

  // Convert SQLite LIMIT ? OFFSET ? to MSSQL OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
  translated = translated.replace(/LIMIT\s+(@p\d+|\d+)\s+OFFSET\s+(@p\d+|\d+)/gi, (match, limit, offset) => {
    return `OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
  });

  // Convert standalone LIMIT to MSSQL OFFSET 0 ROWS FETCH NEXT ... ROWS ONLY
  translated = translated.replace(/LIMIT\s+(@p\d+|\d+)/gi, (match, limit) => {
    return `OFFSET 0 ROWS FETCH NEXT ${limit} ROWS ONLY`;
  });

  return translated;
}

const db = {
  prepare(sqlText) {
    return {
      async get(...params) {
        const p = await getPool();
        const req = p.request();
        const translated = translateSql(sqlText);
        params.forEach((val, i) => {
          req.input(`p${i}`, val === undefined ? null : val);
        });
        const res = await req.query(translated);
        return res.recordset[0] || null;
      },

      async all(...params) {
        const p = await getPool();
        const req = p.request();
        const translated = translateSql(sqlText);
        params.forEach((val, i) => {
          req.input(`p${i}`, val === undefined ? null : val);
        });
        const res = await req.query(translated);
        return res.recordset || [];
      },

      async run(...params) {
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
          changes: res.rowsAffected ? res.rowsAffected[0] : 0
        };
      }
    };
  },

  async exec(sqlText) {
    const p = await getPool();
    return await p.request().query(sqlText);
  },

  transaction(fn) {
    return async (...args) => {
      return await fn(...args);
    };
  }
};

async function initDb() {
  await getPool();
  try {
    await db.exec(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'departments')
      BEGIN
        CREATE TABLE departments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) UNIQUE NOT NULL,
          description NVARCHAR(500) NULL,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );
      END;

      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
      BEGIN
        CREATE TABLE roles (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(50) UNIQUE NOT NULL,
          display_name NVARCHAR(100) NOT NULL,
          description NVARCHAR(500) NULL,
          is_system INT DEFAULT 0,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );
      END;
    `);
  } catch (err) {
    console.error('initDb tables check error:', err.message);
  }
}

module.exports = { db, initDb, sql };
