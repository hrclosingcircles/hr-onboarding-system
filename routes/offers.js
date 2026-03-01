const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// ==============================
// DATABASE CONNECTION
// ==============================
const dbPath = path.join(__dirname, "../hr.db");
const db = new sqlite3.Database(dbPath);

// ==============================
// BASE FRONTEND URL
// ==============================

// If deployed on Render, use FRONTEND_URL
// Otherwise fallback to localhost (for local dev only)
const BASE_URL =
  process.env.FRONTEND_URL && process.env.FRONTEND_URL !== ""
    ? process.env.FRONTEND_URL
    : "http://localhost:3000";

console.log("Using FRONTEND_URL:", BASE_URL);

// ==============================
// TEST ROUTE
// ==============================
router.get("/test", (req, res) => {
  res.json({ message: "Offers route working" });
});

// ==============================
// GET ALL OFFERS
// ==============================
router.get("/", (req, res) => {
  db.all("SELECT * FROM onboarding ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, data: rows });
  });
});

// ==============================
// CREATE OFFER
// ==============================
router.post("/create", (req, res) => {
  const {
    candidate_name,
    email,
    mobile,
    designation,
    salary,
    work_location,
    date_of_joining,
    employment_type,
  } = req.body;

  if (
    !candidate_name ||
    !email ||
    !mobile ||
    !designation ||
    !salary ||
    !work_location ||
    !date_of_joining
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const offer_id =
    "OFF-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const sql = `
    INSERT INTO onboarding
    (
      offer_id,
      candidate_name,
      designation,
      salary,
      work_location,
      date_of_joining,
      employment_type,
      email,
      mobile,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      offer_id,
      candidate_name,
      designation,
      salary,
      work_location,
      date_of_joining,
      employment_type || "Full Time",
      email,
      mobile,
      "Pending",
    ],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Database insert failed",
        });
      }

      res.json({
        success: true,
        message: "Offer Created Successfully",
        offer_id,
        onboarding_link: `${BASE_URL}/onboarding/${offer_id}`,
      });
    }
  );
});

// ==============================
// GET SINGLE OFFER
// ==============================
router.get("/:offer_id", (req, res) => {
  const { offer_id } = req.params;

  db.get(
    "SELECT * FROM onboarding WHERE offer_id = ?",
    [offer_id],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Offer not found",
        });
      }

      res.json(row);
    }
  );
});

module.exports = router;