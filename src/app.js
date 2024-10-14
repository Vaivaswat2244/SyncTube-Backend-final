const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const userDetailsRoutes = require("./routes/userDetailsRoute");
const connectDB = require("./database/db");

connectDB();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/details/", userDetailsRoutes);

app.listen(3000, function () {
  console.log("Listening on port 3000");
});
