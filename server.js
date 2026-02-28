const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// Middleware
// ==============================
app.use(cors());
app.use(express.json());

// ==============================
// Database Connection
// ==============================
const dbPath = path.join(__dirname, "hr.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// ==============================
// Create Table If Not Exists
// ==============================
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
// Start Server
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});