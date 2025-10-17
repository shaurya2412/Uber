// utils/emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const senderEmail = process.env.EMAIL_USER;
const senderPass = process.env.EMAIL_PASS;

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: senderPass,
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    const mailOptions = {
      from: `Uber Clone 🚗 <${senderEmail}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

module.exports = { sendEmail };
