const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const db = require("../database");

function generateAppointmentLetter(offer_id, callback) {
  db.get("SELECT * FROM offers WHERE offer_id = ?", [offer_id], (err, offer) => {
    if (!offer) return callback("Offer not found");

    db.get("SELECT * FROM onboarding WHERE offer_id = ?", [offer_id], (err, emp) => {
      if (!emp) return callback("Employee data not found");

      const lettersDir = path.join(__dirname, "../letters");
      if (!fs.existsSync(lettersDir)) fs.mkdirSync(lettersDir);

      const filePath = path.join(lettersDir, `${offer_id}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(fs.createWriteStream(filePath));

      const logoPath = path.join(__dirname, "../assets/logo.png");
      const stampPath = path.join(__dirname, "../assets/stamp.png");

      /* =========================
         HEADER (LOGO CENTER + DETAILS)
      ========================== */

      function addHeader() {
        if (fs.existsSync(logoPath)) {
          doc.image(
            logoPath,
            (doc.page.width - 120) / 2,
            30,
            { width: 120 }
          );
        }

        doc.moveDown(4);

        doc.fontSize(9).text(
          "Branch Office: TF-17, Tower-J, Darshanam Trade Center-2, Sayajigunj, Vadodara, Gujarat, 390020.",
          { align: "left" }
        );

        doc.text(
          "Contact: +91-9274868100, +91-9274868101, +91-9624609816, +91-8392924368,",
          { align: "left" }
        );

        doc.text(
          "Email: jobs@closingcircle.co.in; sales@closingcircle.co.in; Website: www.closingcircle.co.in",
          { align: "left" }
        );

        doc.moveDown(2);
      }

      addHeader();
      doc.on("pageAdded", addHeader);

      /* =========================
         TITLE
      ========================== */

      doc.fontSize(12).font("Helvetica-Bold").text("Offer letter");
      doc.moveDown();

      doc.font("Helvetica");

      doc.text("To,");
      doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`);
      doc.moveDown();

      doc.text(`${emp.candidate_name}`);
      doc.moveDown();

      /* =========================
         MAIN BODY
      ========================== */

      doc.text(
        `This is to inform you that you have been appointed as a probationary employee in the ${offer.designation} department on the post of ${offer.designation}. Your Job Location will be ${offer.work_location}.`
      );

      doc.moveDown();

      doc.text(
        `You will get a monthly stipend Rs. ${offer.salary}/- and your date of joining in organization is ${offer.date_of_joining}.`
      );

      doc.moveDown();

      doc.text("You will fully fulfill your responsibility.");
      doc.moveDown();

      doc.font("Helvetica-Bold").text("RULES OF THE ORGANIZATION: -");
      doc.font("Helvetica");
      doc.moveDown();

      const rules = [
        "1. You have to attend regularly every day at the appointed time of your duty in the institution. If absent for more than three days without written notice, you will be dismissed.",
        "2. Leave must be informed in writing 10 to 15 days in advance.",
        "3. Payroll will be calculated from 26th to 25th. Stipend will be on 5th of every month.",
        "4. Unauthorized absence will result in double absence marking.",
        "5. Special absence rules apply on Sundays and 1st to 10th.",
        "6. One month notice period required for resignation.",
        "7. Misconduct like intoxication, sleeping or stealing will result in immediate dismissal.",
        "8. Organization may change rules by notice.",
        "9. Prescribed uniform must be worn.",
        "10. Property damage due to negligence must be compensated.",
        "11. Fraud or wrongdoing will result in dismissal.",
        "12. Maintain discipline with customers and colleagues.",
        "13. You may be transferred during employment."
      ];

      rules.forEach(rule => {
        doc.text(rule);
        doc.moveDown(0.5);
      });

      /* =========================
         SIGNATURE BLOCK
      ========================== */

      const requiredSpace = 220;
      if (doc.y + requiredSpace > doc.page.height - 80) {
        doc.addPage();
      }

      doc.moveDown(2);
      doc.text("Thanking You,");
      doc.moveDown();

      // Stamp ABOVE signature
      if (fs.existsSync(stampPath)) {
        doc.image(stampPath, 60, doc.y, { width: 120 });
      }

      doc.moveDown(6);

      doc.font("Helvetica-Bold").text("For Closing Circles", 60);
      doc.moveDown(1.5);
      doc.font("Helvetica").text("Authorised Signatory", 60);

      doc.moveDown(3);
      doc.text(
        "I have read and understood the above terms and conditions and have agree to signed below."
      );

      doc.moveDown();
      doc.text("Candidate’s Signature: __________________________");

      doc.end();
      callback(null, filePath);
    });
  });
}

module.exports = generateAppointmentLetter;