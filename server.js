const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// Middleware
// ==============================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==============================
// Upload Folder Setup
// ==============================
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// serve uploaded files
app.use("/uploads", express.static(uploadDir));

// ==============================
// Database Connection
// ==============================
const dbPath = path.join(__dirname, "hr.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// ==============================
// Create Table + Columns
// ==============================
db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS onboarding (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      offer_id TEXT UNIQUE,
      candidate_name TEXT,
      designation TEXT,
      salary TEXT,
      work_location TEXT,
      date_of_joining TEXT,
      employment_type TEXT,
      email TEXT,
      mobile TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = [
    "father_name TEXT",
    "dob TEXT",
    "gender TEXT",
    "address TEXT",
    "city TEXT",
    "state TEXT",
    "pincode TEXT",
    "bank_name TEXT",
    "account_number TEXT",
    "ifsc TEXT",
    "emergency_name TEXT",
    "emergency_contact TEXT",
    "qualification TEXT",
    "university TEXT",
    "passing_year TEXT",
    "signature TEXT",
    "aadhaar TEXT",
    "pan TEXT",
    "bank_proof TEXT",
    "photo TEXT",
    "signed_appointment TEXT"
  ];

  columns.forEach(col => {
    db.run(`ALTER TABLE onboarding ADD COLUMN ${col}`, err => {});
  });

});

// ==============================
// Routes
// ==============================
const offersRoutes = require("./routes/offers");
app.use("/api/offers", offersRoutes);

// ==============================
// Root Route
// ==============================
app.get("/", (req, res) => {
  res.send("HR Onboarding Backend Running 🚀");
});

// ==============================
// Health Check
// ==============================
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// ==============================
// Start Server
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});