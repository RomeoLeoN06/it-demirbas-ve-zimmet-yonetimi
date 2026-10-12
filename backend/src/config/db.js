const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'inventory.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT CHECK(role IN ('admin', 'personnel')) DEFAULT 'personnel',
      department TEXT,
      phone TEXT,
      avatar_url TEXT,
      google_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      serial_number TEXT UNIQUE NOT NULL,
      purchase_date TEXT,
      warranty_end_date TEXT,
      purchase_cost REAL DEFAULT 0,
      status TEXT CHECK(status IN ('depoda', 'zimmetli', 'arizali', 'bakimda', 'hurda')) DEFAULT 'depoda',
      notes TEXT,
      qr_code_data TEXT,
      assigned_to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assigned_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      return_date DATETIME,
      status TEXT CHECK(status IN ('aktif', 'iade_edildi')) DEFAULT 'aktif',
      handover_notes TEXT,
      return_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
    CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
    CREATE INDEX IF NOT EXISTS idx_assets_code ON assets(asset_code);
    CREATE INDEX IF NOT EXISTS idx_assignments_asset ON assignments(asset_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments(user_id);
  `);
}

module.exports = { db, initDb };
