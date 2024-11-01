const express = require("express");
const verifyToken = require("../middleware/verifyToken");

const app = express();

function checkUser(req, res, next) {
  if (req.path.toLowerCase() === "/api/auth/signup" || req.path.toLowerCase() === "/api/auth/signin"){
    return next();
  }

  verifyToken(req, res, next);
}
module.exports = checkUser;
