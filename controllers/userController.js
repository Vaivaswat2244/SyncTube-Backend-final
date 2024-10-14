const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const jwtPassword = "gibberish;(";
var email_verifier = require("email-verify");
const bcrypt = require("bcryptjs");

async function userExists(email, password) {
  let userExist = false;

  const existingUser = await User.findOne({ email });
  async function validate(password) {
    var valid = false;
    valid = await bcrypt.compare(password, existingUser.password);
    return valid;
  }

  if (existingUser && (await validate(password))) {
    userExist = true;
  }

  return userExist;
}

module.exports = {
  async signup(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.firstName + req.body.lastName;

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

      try {
        await user.save();
        const tokenPayload = {
          user_id: user._id,
          email: user.email,
        };
    
        var token = jwt.sign(tokenPayload, jwtPassword, { expiresIn: "6h" });
        console.log("token genrated");

        res
        .cookie("jwt", token, { httpOnly: true, maxAge: 21600000, sameSite: 'Strict' });
        console.log("cookie sent");
        return res.json({
          msg: "Login Successful",
          user: tokenPayload,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    } else {
      return res
        .status(400)
        .send("Invalid Email Address, Please enter a valid email address.");
    }
  }
  ,

  async signin(req, res) {
    const email = req.body.email;
    const password = req.body.password;

     if (!(await userExists(email, password))) {
       return res.status(403).json({
         msg: "User doesnt exist in our in memory db",
       });
     }
    const existingUser = await User.findOne({ email });

    const tokenPayload = {
      user_id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role
      
    };

    var token = jwt.sign(tokenPayload, jwtPassword, { expiresIn: "6h" });
    console.log("token genrated");

    res
    .status(202)
    .cookie("jwt", token, { httpOnly: true, maxAge: 21600000, sameSite: 'Strict' });
    console.log("cookie sent");
    return res.json({
      msg: "Login Successful",
      user: tokenPayload,
    });
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
