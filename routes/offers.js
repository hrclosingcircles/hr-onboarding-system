const express = require("express");
const router = express.Router();

// ==============================
// TEST ROUTE
// ==============================
router.get("/test", (req, res) => {
  res.json({ message: "Offers route working (PostgreSQL)" });
});


// ==============================
// GET ALL OFFERS
// ==============================
router.get("/", async (req, res) => {
  try {
    const result = await req.pool.query(
      "SELECT * FROM onboarding ORDER BY id DESC"
    );

    res.json({
      success: true,
      data: result.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ==============================
// CREATE OFFER
// ==============================
router.post("/create", async (req, res) => {
  try {
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

    const BASE_URL =
      process.env.FRONTEND_URL || "http://localhost:3000";

    await req.pool.query(
      `
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
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
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
      ]
    );

    res.json({
      success: true,
      message: "Offer Created Successfully",
      offer_id,
      onboarding_link: `${BASE_URL}/onboarding/${offer_id}`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Database insert failed",
    });
  }
});


// ==============================
// GET SINGLE OFFER
// ==============================
router.get("/:offer_id", async (req, res) => {
  try {

    const { offer_id } = req.params;

    const result = await req.pool.query(
      "SELECT * FROM onboarding WHERE offer_id=$1",
      [offer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ==============================
// SUBMIT ONBOARDING
// ==============================
router.post("/:offer_id/submit", async (req, res) => {
  try {

    const { offer_id } = req.params;

    const { joiningDetails, signature } = req.body;

    const details = JSON.parse(joiningDetails);

    await req.pool.query(
      `
      UPDATE onboarding SET
      father_name=$1,
      dob=$2,
      gender=$3,
      address=$4,
      city=$5,
      state=$6,
      pincode=$7,
      bank_name=$8,
      account_number=$9,
      ifsc=$10,
      emergency_name=$11,
      emergency_contact=$12,
      qualification=$13,
      university=$14,
      passing_year=$15,
      signature=$16,
      status='Completed'
      WHERE offer_id=$17
      `,
      [
        details.father_name,
        details.dob,
        details.gender,
        details.address,
        details.city,
        details.state,
        details.pincode,
        details.bank_name,
        details.account_number,
        details.ifsc,
        details.emergency_name,
        details.emergency_contact,
        details.qualification,
        details.university,
        details.passing_year,
        signature,
        offer_id,
      ]
    );

    res.json({
      success: true,
      message: "Onboarding submitted successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Submission failed",
    });
  }
});


module.exports = router;