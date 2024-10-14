const crypto = require("crypto");
const nodemailer = require("nodemailer");

function generateOTP() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

function sendOTPEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "localhost:3000",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "synctubeofficial@gmail.com",
      pass: "nagq obld kvat qnxf",
    },
  });

  const mailOptions = {
    from: "synctubeofficial@gmail.com",
    to: email,
    subject: "Forgot Password OTP",
    text: `Your OTP for password reset is: ${otp}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Failed to send OTP:", error);
    } else {
      console.log("OTP sent successfully:", info.response);
    }
  });
}

module.exports = { generateOTP, sendOTPEmail };
