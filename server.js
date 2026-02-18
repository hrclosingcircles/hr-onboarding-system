const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- DATABASE CONNECTION ---------- */

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hr@1234",
  database: "hr_onboarding"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

/* ---------- TEST ROUTE ---------- */

app.get("/", (req, res) => {
  res.send("HR System Backend Running");
});

/* ---------- GET ALL WORKERS ---------- */

app.get("/api/workers", (req, res) => {
  db.query("SELECT * FROM workers", (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

/* ---------- START SERVER ---------- */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
