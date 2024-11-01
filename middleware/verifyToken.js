const jwt = require("jsonwebtoken");
const jwtPassword = "gibberish;(";

function verifyToken(req, res, next) {
  // const token = req.cookies.jwt;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Token not present" });
  }

  jwt.verify(token, jwtPassword, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
