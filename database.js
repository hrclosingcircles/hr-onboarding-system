const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "hr.db");
console.log("DATABASE PATH:", dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database error:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

db.serialize(() => {

  console.log("🔥 Creating tables if not exist...");

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'admin'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      offer_id TEXT UNIQUE,
      designation TEXT,
      employment_type TEXT,
      salary TEXT,
      work_location TEXT,
      date_of_joining TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS onboarding (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      offer_id TEXT,
      candidate_name TEXT,
      father_name TEXT,
      mobile TEXT,
      aadhaar_no TEXT,
      aadhaar_file TEXT,
      pan_file TEXT,
      bank_file TEXT,
      photo_file TEXT,
      signed_file TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

});

module.exports = db;