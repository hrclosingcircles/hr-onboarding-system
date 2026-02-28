const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../database");
const sendWelcomeEmail = require("../services/emailService");

/* ======================================================
   ENSURE UPLOADS FOLDER EXISTS
====================================================== */
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* ======================================================
   MULTER STORAGE CONFIG
====================================================== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const offerId = req.params.offerId;
    const docType = req.params.type || "document";
    const ext = path.extname(file.originalname);
    const uniqueName = `${offerId}-${docType}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/* ======================================================
   TEST ROUTE
====================================================== */
router.get("/test", (req, res) => {
  res.json({ message: "Upload route working ✅" });
});

/* ======================================================
   GENERIC DOCUMENT UPLOAD
   /api/upload/:type/:offerId
====================================================== */
router.post("/:type/:offerId", upload.single("file"), (req, res) => {
  const { type, offerId } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded"
    });
  }

  const fileName = req.file.filename;
  const filePath = `/uploads/${fileName}`;

  let columnName = "";

  switch (type) {
    case "aadhaar":
      columnName = "aadhaar_file";
      break;
    case "pan":
      columnName = "pan_file";
      break;
    case "bank":
      columnName = "bank_file";
      break;
    case "photo":
      columnName = "photo_file";
      break;
    case "signed":
      columnName = "signed_file";
      break;
    default:
      return res.status(400).json({
        success: false,
        message: "Invalid upload type"
      });
  }

  /* ======================================================
     UPDATE DATABASE
  ====================================================== */
  if (type === "signed") {
    // Update signed file + change status to Joined
    db.run(
      `UPDATE onboarding 
       SET ${columnName} = ?, status = 'Joined'
       WHERE offer_id = ?`,
      [filePath, offerId],
      function (err) {
        if (err) {
          console.error("DB Error:", err.message);
          return res.status(500).json({
            success: false,
            message: "Database update failed"
          });
        }

        // Fetch email + candidate name
        db.get(
          `SELECT candidate_name, email FROM onboarding WHERE offer_id = ?`,
          [offerId],
          async (err, row) => {
            if (!err && row && row.email) {
              console.log("DEBUG EMAIL DATA:", row);
              await sendWelcomeEmail(row.email, row.candidate_name);
            }
          }
        );

        res.json({
          success: true,
          message: "Signed uploaded. Status changed to Joined",
          fileName,
          filePath
        });
      }
    );
  } else {
    // Normal document upload
    db.run(
      `UPDATE onboarding 
       SET ${columnName} = ?
       WHERE offer_id = ?`,
      [filePath, offerId],
      function (err) {
        if (err) {
          console.error("DB Error:", err.message);
          return res.status(500).json({
            success: false,
            message: "Database update failed"
          });
        }

        res.json({
          success: true,
          message: "File uploaded successfully",
          fileName,
          filePath
        });
      }
    );
  }
});

module.exports = router;