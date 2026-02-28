const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "hr.db");

console.log("DATABASE PATH:", dbPath);

// ✅ CREATE DATABASE CONNECTION
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// ✅ FORCE REBUILD TABLE (ONLY FOR CLEAN RESET)
db.serialize(() => {
  console.log("🔥 Rebuilding onboarding table...");

  

  db.run(`
    CREATE TABLE onboarding (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      offer_id TEXT UNIQUE,
      candidate_name TEXT,
      designation TEXT,
      salary TEXT,
      work_location TEXT,
      date_of_joining TEXT,
      employment_type TEXT,
      mobile TEXT,
      email TEXT,
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