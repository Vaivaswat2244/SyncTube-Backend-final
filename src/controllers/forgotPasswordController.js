const nodemailer = require("nodemailer");
const userService = require("../services/userService");
const { generateOTP, sendOTPEmail } = require("../utils/otpUtils");

//Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "synctubeofficial@gmail.com",
    pass: "nagq obld kvat qnxf",
  },
});

module.exports = {
  async initiateForgotPassword(req, res) {
    const email = req.body.email;

    try {
      const user = await userService.findUserByEmail(email);

      if (!user) {
        return res.status(404).json({
          msg: "User not found",
        });
      }

      const otp = generateOTP();
      user.otp = otp;
      await user.save();

      const mailOptions = {
        from: "synctubeofficial@gmail.com",
        to: email,
        subject: "Forgot Password OTP",
        text: `Your OTP for password reset is: ${otp}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error("Failed to send OTP:", error);
          return res.status(500).json({
            msg: "Failed to send OTP",
          });
        }

        res.json({
          msg: "OTP sent successfully",
        });
      });
    } catch (error) {
      console.error("Error initiating forgot password:", error);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  },

  async verifyOTP(req, res) {
    const email = req.body.email;
    const otp = req.body.otp;
    const newPassword = req.body.newPassword;

    try {
      const user = await userService.verifyOTP(email, otp);

      if (!user) {
        return res.status(403).json({
          msg: "Invalid OTP",
        });
      }

      user.password = newPassword;
      user.otp = undefined;
      await user.save();

      res.json({
        msg: "Password reset successfully",
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  },
};
