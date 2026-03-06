const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

// ==============================
// DB
// ==============================
const dbPath = path.join(__dirname, "../hr.db");
const db = new sqlite3.Database(dbPath);

// ==============================
// Upload Folder
// ==============================
const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

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

  db.all(
    "SELECT * FROM onboarding ORDER BY id DESC",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({ success: false });
      }

      res.json({
        success: true,
        data: rows
      });

    }
  );

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
    employment_type
  } = req.body;

  const offer_id =
    "OFF-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const BASE_URL =
    process.env.FRONTEND_URL ||
    "http://localhost:3000";

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
  VALUES (?,?,?,?,?,?,?,?,?,?)
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
      "Pending"
    ],
    function (err) {

      if (err) {
        return res.status(500).json({
          success: false
        });
      }

      res.json({
        success: true,
        offer_id,
        onboarding_link: `${BASE_URL}/onboarding/${offer_id}`
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
    "SELECT * FROM onboarding WHERE offer_id=?",
    [offer_id],
    (err, row) => {

      if (err) {
        return res.status(500).json({ success: false });
      }

      if (!row) {
        return res.status(404).json({ success: false });
      }

      res.json(row);

    }
  );

});

// ==============================
// SUBMIT ONBOARDING
// ==============================
router.post(
  "/:offer_id/submit",
  upload.fields([
    { name: "aadhaar" },
    { name: "pan" },
    { name: "bank_proof" },
    { name: "photo" },
    { name: "signedAppointment" }
  ]),
  (req, res) => {

    const { offer_id } = req.params;

    const joining = JSON.parse(req.body.joiningDetails);

    const signature = req.body.signature;

    const aadhaar =
      req.files["aadhaar"]?.[0]?.filename || null;

    const pan =
      req.files["pan"]?.[0]?.filename || null;

    const bank_proof =
      req.files["bank_proof"]?.[0]?.filename || null;

    const photo =
      req.files["photo"]?.[0]?.filename || null;

    const signed_appointment =
      req.files["signedAppointment"]?.[0]?.filename || null;

    const sql = `
    UPDATE onboarding SET
    father_name=?,
    dob=?,
    gender=?,
    address=?,
    city=?,
    state=?,
    pincode=?,
    bank_name=?,
    account_number=?,
    ifsc=?,
    emergency_name=?,
    emergency_contact=?,
    qualification=?,
    university=?,
    passing_year=?,
    signature=?,
    aadhaar=?,
    pan=?,
    bank_proof=?,
    photo=?,
    signed_appointment=?,
    status='Completed'
    WHERE offer_id=?
    `;

    db.run(
      sql,
      [
        joining.father_name,
        joining.dob,
        joining.gender,
        joining.address,
        joining.city,
        joining.state,
        joining.pincode,
        joining.bank_name,
        joining.account_number,
        joining.ifsc,
        joining.emergency_name,
        joining.emergency_contact,
        joining.qualification,
        joining.university,
        joining.passing_year,
        signature,
        aadhaar,
        pan,
        bank_proof,
        photo,
        signed_appointment,
        offer_id
      ],
      function (err) {

        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false
          });
        }

        res.json({
          success: true,
          message: "Onboarding submitted"
        });

      }
    );

  }
);

module.exports = router;