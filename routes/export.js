console.log("🔥 EXPORT ROUTE LOADED");const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");
const db = require("../database");
const authenticateToken = require("../middleware/auth");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employees");

    worksheet.columns = [
      { header: "Offer ID", key: "offer_id", width: 15 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Employment Type", key: "employment_type", width: 20 },
      { header: "Salary", key: "salary", width: 15 },
      { header: "Location", key: "work_location", width: 20 },
      { header: "Date of Joining", key: "date_of_joining", width: 20 }
    ];

    db.all("SELECT * FROM offers", [], async (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Export failed" });
      }

      rows.forEach(row => {
        worksheet.addRow(row);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=ClosingCircles_Employees.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Excel generation error" });
  }
});

module.exports = router;