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
// BASE FRONTEND URL (Dynamic)
// ==============================
// Local: http://localhost:3000
// Production: Set FRONTEND_URL in Render
const BASE_URL = process.env.FRONTEND_URL || "http://localhost:3000";


// ==============================
// ✅ TEST ROUTE
// ==============================
router.get("/test", (req, res) => {
  res.json({ message: "Offers route working ✅" });
});


// ==============================
// ✅ GET ALL OFFERS (Dashboard)
// ==============================
router.get("/", (req, res) => {
  db.all(
    "SELECT * FROM onboarding ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("Fetch error:", err);
        return res.status(500).json({
          success: false,
          message: "Server error",
        });
      }

      res.json({
        success: true,
        data: rows,
      });
    }
  );
});


// ==============================
// ✅ CREATE OFFER
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

  // Validation
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

  // Generate Unique Offer ID
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
        console.error("Insert error:", err);
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
// ✅ GET SINGLE OFFER (Onboarding Page)
// ==============================
router.get("/:offer_id", (req, res) => {
  const { offer_id } = req.params;

  db.get(
    "SELECT * FROM onboarding WHERE offer_id = ?",
    [offer_id],
    (err, row) => {
      if (err) {
        console.error("Fetch single error:", err);
        return res.status(500).json({
          success: false,
          message: "Server error",
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Offer Not Found",
        });
      }

      res.json({
        success: true,
        data: row,
      });
    }
  );
});


// ==============================
// ✅ UPDATE STATUS
// ==============================
router.put("/status/:offer_id", (req, res) => {
  const { offer_id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  db.run(
    "UPDATE onboarding SET status = ? WHERE offer_id = ?",
    [status, offer_id],
    function (err) {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({
          success: false,
          message: "Status update failed",
        });
      }

      res.json({
        success: true,
        message: "Status updated successfully",
      });
    }
  );
});


// ==============================
// ✅ DELETE OFFER (Optional)
// ==============================
router.delete("/:offer_id", (req, res) => {
  const { offer_id } = req.params;

  db.run(
    "DELETE FROM onboarding WHERE offer_id = ?",
    [offer_id],
    function (err) {
      if (err) {
        console.error("Delete error:", err);
        return res.status(500).json({
          success: false,
          message: "Delete failed",
        });
      }

      res.json({
        success: true,
        message: "Offer deleted successfully",
      });
    }
  );
});

module.exports = router;