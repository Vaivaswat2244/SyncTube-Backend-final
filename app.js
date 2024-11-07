require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoute");
const userDetailsRoutes = require("./routes/userRoute");
const projectRoutes = require("./routes/projectRoute");
const applicationRoutes = require("./routes/applicationRoute");
const userRoute = require("./routes/userRoute");
const connectDB = require("./database/db");
const checkUser = require("./middleware/checkUser");
const cors = require("cors");

connectDB();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(checkUser);
app.use(cors({credentials: true, origin:"http://localhost:3000"}));

app.use("/api/auth", authRoutes);
app.use("/api/users/", userDetailsRoutes);
app.use("/api/project/", projectRoutes);
app.use('/api/application/', applicationRoutes);
app.use("/api/profile", userRoute);

app.get('/',(req,res)=>{
  res.send("Hello There")
})



app.listen(3002, function () {
  console.log("Listening on port 3002");
});
