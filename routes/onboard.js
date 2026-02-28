const express = require("express");
const router = express.Router();
const db = require("../database");

/* ======================================================
   GET ALL ONBOARDING RECORDS (ADMIN)
====================================================== */
router.get("/all", (req, res) => {
  db.all(
    "SELECT * FROM onboarding ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        data: rows
      });
    }
  );
});

/* ======================================================
   GET SINGLE RECORD BY OFFER ID
====================================================== */
router.get("/:offer_id", (req, res) => {
  db.get(
    "SELECT * FROM onboarding WHERE offer_id = ?",
    [req.params.offer_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Offer not found"
        });
      }

      res.json({
        success: true,
        data: row
      });
    }
  );
});

module.exports = router;