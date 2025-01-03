const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    user_id: { type: String, unique: true },
    name: { type: String, required: [true] },
    email: { type: String, required: [true] },
    password: { type: String, required: [true] },
    otp: String,
    role: { type: String, enum: ["editor", "youtuber"] },
    youtuber_desc: String,
    channelName: String,
    youtuber_Image: {
      data: Buffer,
      contentType: String
  },

    editor_desc: String,
    past_xp: String,
    portfolio_link: String,
    resume_link: String,
    editor_Image: {
      data: Buffer,
      contentType: String
  }
  },
  {
    collection: "UserInfo",
  }
);

UserSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

var User = mongoose.model("User", UserSchema);

module.exports = User;
