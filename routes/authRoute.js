const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const ForgotPasswordController = require("../controllers/forgotPasswordController");

router.post("/signup", UserController.signup);
router.post("/signin", UserController.signin);
router.get("/users", UserController.getUsers);
router.post("/forgot", ForgotPasswordController.initiateForgotPassword);
router.post("/verify", ForgotPasswordController.verifyOTP);

module.exports = router;
