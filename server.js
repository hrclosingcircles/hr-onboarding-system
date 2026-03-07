const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= DATABASE =================
const db = new sqlite3.Database("./hr.db");

// ================= UPLOAD FOLDER =================
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static(uploadDir));

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// =================================================
// GET ALL OFFERS
// =================================================
app.get("/api/offers", (req, res) => {

  db.all("SELECT * FROM onboarding ORDER BY id DESC", [], (err, rows) => {

    if (err) {
      return res.status(500).json({ success: false });
    }

    res.json({
      success: true,
      data: rows
    });

  });

});

// =================================================
// CREATE OFFER
// =================================================
app.post("/api/offers/create", (req, res) => {

  const {
    candidate_name,
    email,
    mobile,
    designation,
    salary,
    work_location,
    date_of_joining
  } = req.body;

  const offer_id =
    "OFF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const sql = `
  INSERT INTO onboarding
  (
  offer_id,
  candidate_name,
  designation,
  salary,
  work_location,
  date_of_joining,
  email,
  mobile,
  status
  )
  VALUES (?,?,?,?,?,?,?,?,?)
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
      email,
      mobile,
      "Pending"
    ],
    function (err) {

      if (err) {
        return res.status(500).json({ success: false });
      }

      const link =
        `https://hr-frontend-bay.vercel.app/onboarding/${offer_id}`;

      res.json({
        success: true,
        onboarding_link: link
      });

    }
  );

});

// =================================================
// GET OFFER FOR ONBOARDING
// =================================================
app.get("/api/offers/:offer_id", (req, res) => {

  const offer_id = req.params.offer_id;

  db.get(
    "SELECT * FROM onboarding WHERE offer_id=?",
    [offer_id],
    (err, row) => {

      if (!row) {
        return res.status(404).json({ success: false });
      }

      res.json(row);

    }
  );

});

// =================================================
// SUBMIT ONBOARDING
// =================================================
app.post(
  "/api/offers/:offer_id/submit",
  upload.fields([
    { name: "aadhaar" },
    { name: "pan" },
    { name: "bank_proof" },
    { name: "photo" },
    { name: "signedAppointment" }
  ]),
  (req, res) => {

    const offer_id = req.params.offer_id;

    let joining = {};

    if (req.body.joiningDetails) {
      joining = JSON.parse(req.body.joiningDetails);
    }

    const signature = req.body.signature || null;

    const aadhaar = req.files?.aadhaar?.[0]?.filename || null;
    const pan = req.files?.pan?.[0]?.filename || null;
    const bank_proof = req.files?.bank_proof?.[0]?.filename || null;
    const photo = req.files?.photo?.[0]?.filename || null;
    const signed_appointment =
      req.files?.signedAppointment?.[0]?.filename || null;

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
          return res.status(500).json({ success: false });
        }

        res.json({
          success: true,
          message: "Onboarding submitted"
        });

      }
    );

  }
);

// =================================================
// DELETE EMPLOYEE
// =================================================
app.delete("/api/offers/:id", (req, res) => {

  const id = req.params.id;

  db.run("DELETE FROM onboarding WHERE id=?", [id], function (err) {

    if (err) {
      return res.status(500).json({ success: false });
    }

    res.json({ success: true });

  });

});

// =================================================
// OFFER LETTER
// =================================================
app.get("/api/offers/:id/offer-letter", (req, res) => {

  const id = req.params.id;

  db.get("SELECT * FROM onboarding WHERE id=?", [id], (err, row) => {

    if (!row) {
      return res.send("Offer not found");
    }

    const html = `
    <h1>Appointment Letter</h1>

    <p>Name: ${row.candidate_name}</p>
    <p>Designation: ${row.designation}</p>
    <p>Salary: ${row.salary}</p>
    <p>Location: ${row.work_location}</p>
    <p>Joining Date: ${row.date_of_joining}</p>

    <h3>Employee Signature</h3>

    <img src="${row.signature}" width="200"/>
    `;

    res.send(html);

  });

});

// =================================================
// SERVER
// =================================================
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});