const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'backend', 'data', 'inventory.db');
const db = new Database(dbPath);

const users = db.prepare('SELECT * FROM users').all();
const assets = db.prepare('SELECT * FROM assets').all();
const assignments = db.prepare('SELECT * FROM assignments').all();
const audit_logs = db.prepare('SELECT * FROM audit_logs').all();

const data = { users, assets, assignments, audit_logs };
fs.writeFileSync(path.join(__dirname, 'sqlite_data.json'), JSON.stringify(data, null, 2), 'utf-8');

console.log(`Exported from SQLite: ${users.length} users, ${assets.length} assets, ${assignments.length} assignments, ${audit_logs.length} audit logs.`);
