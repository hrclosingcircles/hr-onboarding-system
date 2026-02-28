const nodemailer = require("nodemailer");

/* ======================================================
   EMAIL CONFIGURATION - Closing Circles HR
====================================================== */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hrclosingcircles@gmail.com",
    pass: "cfmnsfosgrhqtomn" // Gmail App Password (NO SPACES)
  }
});

/* ======================================================
   VERIFY CONNECTION ON START (Optional but Professional)
====================================================== */

transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email server connection failed:", error.message);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

/* ======================================================
   SEND WELCOME EMAIL AFTER SIGNED UPLOAD
====================================================== */

async function sendWelcomeEmail(toEmail, candidateName) {
  try {

    if (!toEmail) {
      console.log("⚠ No email provided, skipping email send.");
      return;
    }

    const mailOptions = {
      from: '"Closing Circles HR" <hrclosingcircles@gmail.com>',
      to: toEmail,
      subject: "Welcome to Closing Circles 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 10px;">
          <h2 style="color:#2c3e50;">Welcome ${candidateName},</h2>

          <p>Your signed appointment letter has been successfully received.</p>

          <p>
            We are excited to officially welcome you to 
            <strong>Closing Circles</strong>.
          </p>

          <br/>

          <p>
            Our HR team will connect with you shortly regarding onboarding formalities.
          </p>

          <br/><br/>

          <p>Best Regards,</p>
          <p><strong>Closing Circles HR Team</strong></p>
          <p>Email: hrclosingcircles@gmail.com</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Welcome email sent successfully to:", toEmail);

  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
}

/* ======================================================
   EXPORT FUNCTION
====================================================== */

module.exports = sendWelcomeEmail;