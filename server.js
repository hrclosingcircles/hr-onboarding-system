const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// Middleware
// ==============================
app.use(cors());
app.use(express.json());

// ==============================
// PostgreSQL Connection
// ==============================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Database connection error:", err));

// ==============================
// Create Table If Not Exists
// ==============================
pool.query(`
CREATE TABLE IF NOT EXISTS onboarding (
  id SERIAL PRIMARY KEY,
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

  father_name TEXT,
  dob TEXT,
  gender TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,

  bank_name TEXT,
  account_number TEXT,
  ifsc TEXT,

  emergency_name TEXT,
  emergency_contact TEXT,

  qualification TEXT,
  university TEXT,
  passing_year TEXT,

  signature TEXT,
  aadhaar TEXT,
  pan TEXT,
  bank_proof TEXT,
  photo TEXT,
  signed_appointment TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`)
.then(() => console.log("✅ Table ensured"))
.catch(err => console.error("Table creation error:", err));

// ==============================
// Make pool available in routes
// ==============================
app.use((req, res, next) => {
  req.pool = pool;
  next();
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
  res.send("HR Onboarding Backend Running 🚀 (PostgreSQL)");
});

// ==============================
// Start Server
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});