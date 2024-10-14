const express = require("express");
const verifyToken = require("../middleware/verifyToken");

const app = express();

app.all("*", checkUser);

function checkUser(req, res, next) {
  const nonSecurePaths = ["/api/users/signin", "/api/users/signup"];

  if (req && req.path && nonSecurePaths.includes(req.path)) {
    return next();
  }
  verifyToken(req, res, next);
}
module.exports = checkUser;
