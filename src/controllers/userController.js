const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const jwtPassword = "gibberish;(";
var email_verifier = require("email-verify");
const bcrypt = require("bcryptjs");

async function userExists(email, password) {
  let userExist = false;

  const existingUser = await User.findOne({ email });

  if (existingUser && (await bcrypt.compare(password, existingUser.password))) {
    userExist = true;
  }

  return userExist;
}

module.exports = {
  async signup(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    async function verified_answer() {
      return new Promise((resolve, reject) => {
        email_verifier.verify(email, function (err, info) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log(info.success);
            resolve(info.success);
          }
        });
      });
    }

    const isEmailValid = await verified_answer();

    if (isEmailValid) {
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        return res.status(400).send("Username/Email Already Exists!");
      }

      const user = new User({
        name: name,
        email: email,
        password: password,
      });

      user.save();
      res.json({
        msg: "User successfully created.",
      });
    } else {
      return res
        .status(400)
        .send("Invalid Email Address, Please enter a valid email address.");
    }
  },

  async signin(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    if (!userExists(email, password)) {
      return res.status(403).json({
        msg: "User doesnt exist in our in memory db",
      });
    }

    var token = jwt.sign({ email: email }, jwtPassword, { expiresIn: "6h" });

    res.cookie("jwt", token, { httpOnly: true, maxAge: 21600000 });

    return res.json("Login Successful");
  },

  async getUsers(req, res) {
    const token = req.headers.authorization;

    try {
      const decoded = jwt.verify(token, jwtPassword);
      const userEmail = decoded.email;

      const allUsers = await User.find({ email: { $ne: userEmail } });

      const usernames = allUsers.map((user) => user.name);

      res.json({
        usernames: usernames,
      });
    } catch (err) {
      console.error(err);
      return res.status(403).json({
        msg: "Invalid token",
      });
    }
  },
};
