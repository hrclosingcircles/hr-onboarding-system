const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateAppointment(worker) {
  const doc = new PDFDocument({ margin: 50 });
  const path = `letters/${worker.worker_id}.pdf`;

  doc.pipe(fs.createWriteStream(path));

  // LOGO
  doc.image("assets/logo.png", 50, 30, { width: 120 });

  doc.moveDown(4);
  doc.fontSize(16).text("APPOINTMENT LETTER", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.text(`To,`);
  doc.text(worker.full_name);
  doc.text(worker.address);
  doc.moveDown();

  doc.text(`Subject: Appointment as ${worker.designation}`);
  doc.moveDown();

  doc.text(`
Dear ${worker.full_name},

We are pleased to appoint you as ${worker.designation} in the ${worker.department} Department with effect from ${worker.joining_date} at ${worker.work_location}.

Your monthly consolidated salary shall be ₹${worker.salary} subject to statutory deductions as applicable under law.

TERMS & CONDITIONS

1. Your employment is subject to satisfactory verification of all documents submitted by you.
2. You shall devote your full time and attention to the duties assigned by the Company.
3. You shall comply with all rules, regulations and policies of the Company.
4. You shall maintain strict confidentiality of Company information.
5. Either party may terminate employment by giving 30 days written notice.
6. The Company reserves the right to terminate employment without notice in case of misconduct.
7. This appointment is governed by the applicable labour laws of India.

Please sign and return a copy of this letter as a token of your acceptance.

We welcome you to HR Closing Circles Pvt. Ltd. and wish you a successful career.

For HR Closing Circles Pvt. Ltd.
`);

  doc.moveDown(3);

  // LARGE STAMP
  doc.image("assets/stamp.png", 50, doc.y, { width: 160 });

  doc.moveDown(4);
  doc.text("Authorized Signatory");

  doc.moveDown(6);
  doc.fontSize(8).text(
    "Registered Office: HR Closing Circles Pvt. Ltd., Ahmedabad, Gujarat, India | Email: hr@hrclosingcircles.com | Contact: +91-XXXXXXXXXX",
    { align: "center" }
  );

  doc.end();
}

module.exports = generateAppointment;