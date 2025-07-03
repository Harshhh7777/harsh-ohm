const nodemailer = require("nodemailer");

console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
console.log("🔐 EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail
    pass: process.env.EMAIL_PASS,   // your App Password
  },
});

const sendEmail = async ({ subject, text, html }) => {
  const mailOptions = {
    from: `"Portfolio Notifier" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // send to yourself
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("❌ Email error:", err);
    } else {
      console.log("✅ Email sent:", info.response);
    }
  });
};

module.exports = sendEmail;
