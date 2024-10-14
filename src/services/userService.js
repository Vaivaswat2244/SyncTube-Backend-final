const User = require("../models/Users");

async function findUserByEmail(email) {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
}

async function verifyOTP(email, otp) {
  try {
    const user = await User.findOne({ email, otp });
    return user;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

module.exports = {
  findUserByEmail,
  verifyOTP,
};
